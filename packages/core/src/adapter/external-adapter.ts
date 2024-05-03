import { bind, bindAll } from 'bind-event-listener';

import {
  type AdapterAPI,
  type BaseEventPayload,
  type CleanupFn,
  type DropTargetEventBasePayload,
  type DropTargetEventPayloadMap,
  type DropTargetGetFeedbackArgs,
  type EventPayloadMap,
  type ExternalDragPayload,
  type ExternalDragType,
  type MonitorGetFeedbackArgs,
  type NativeMediaType,
} from '../internal-types';
import { makeAdapter } from '../make-adapter/make-adapter';
import { androidFallbackText } from '../util/android';
import { isEnteringWindow } from '../util/changing-window/is-entering-window';
import { getBindingsForBrokenDrags } from '../util/detect-broken-drag';
import { textMediaType } from '../util/media-types/text-media-type';

import { elementAdapterNativeDataKey } from './element-adapter-native-data-key';

export function isAnAvailableType({
  type,
  value,
}: {
  type: string;
  value: string;
}): boolean {
  // We don't want to expose our private elementAdapter key / value
  if (type === elementAdapterNativeDataKey) {
    return false;
  }
  // Not exposing "text/plain" if it contains the android fallback text
  // We _could_ add an `isAndroid()` check, but it's probably safest
  // to trim this data out, regardless of what OS we see it on.
  if (type === textMediaType && value === androidFallbackText) {
    return false;
  }
  return true;
}

export function getAvailableTypes(transfer: DataTransfer): NativeMediaType[] {
  return Array.from(transfer.types).filter(type =>
    isAnAvailableType({ type, value: transfer.getData(type) }),
  );
}

export function getAvailableItems(
  dataTransfer: DataTransfer,
): DataTransferItem[] {
  // item.kind is 'string' | 'file'
  // For 'string' item.type is the mimeType (eg 'text/plain')
  // For 'file' item.type is the file type (eg 'image/jpg')

  return Array.from(dataTransfer.items).filter(
    item =>
      item.kind === 'file' ||
      isAnAvailableType({
        type: item.type,
        value: dataTransfer.getData(item.type),
      }),
  );
}

let didDragStartLocally: boolean = false;

const adapter = makeAdapter<ExternalDragType>({
  typeKey: 'external',
  // for external drags, we are generally making a copy of something that is being dragged
  defaultDropEffect: 'copy',
  mount(api: AdapterAPI<ExternalDragType>): CleanupFn {
    // Binding to the `window` so that the element adapter
    // has a chance to get in first on the`document`.
    // We are giving preference to the element adapter.
    return bind(window, {
      type: 'dragenter',
      listener(event: DragEvent) {
        // drag operation was started within the document, it won't be an "external" drag
        if (didDragStartLocally) {
          return;
        }

        // Note: not checking if event was cancelled (`event.defaultPrevented`) as
        // cancelling a "dragenter" accepts the drag operation (not prevent it)

        // Something has gone wrong with our drag event
        if (!event.dataTransfer) {
          // Including this code on "test" and "development" environments:
          // - Browser tests commonly run against "development" builds
          // - Unit tests commonly run in "test"
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn(
              `
              It appears as though you have are not testing DragEvents correctly.

              - If you are unit testing, ensure you have pollyfilled DragEvent.
              - If you are browser testing, ensure you are dispatching drag events correctly.

              Please see our testing guides for more information:
              https://atlassian.design/components/pragmatic-drag-and-drop/core-package/testing
            `.replace(/ {2}/g, ''),
            );
          }
          return;
        }

        if (!api.canStart(event)) {
          return;
        }

        if (!isEnteringWindow({ dragEnter: event })) {
          return;
        }

        // Note: not checking types for `elementAdapterNativeDataKey` as we expect to see that
        // key when pdnd started the drag in another document
        const types = getAvailableTypes(event.dataTransfer);

        if (!types.length) {
          return;
        }
        const locked: ExternalDragPayload = {
          types,
          items: [],
          getStringData: () => null,
        };

        api.start({
          event,
          dragType: {
            type: 'external',
            startedFrom: 'external',
            payload: locked,
            getDropPayload(event): ExternalDragPayload {
              // this would be a platform error
              // trying to handle it gracefully rather than throwing (for now)
              if (!event.dataTransfer) {
                return locked;
              }

              const items = getAvailableItems(event.dataTransfer);
              // need to use `.bind` as `getData` is required
              // to be run with `event.dataTransfer` as the "this" context
              const nativeGetData = event.dataTransfer.getData.bind(
                event.dataTransfer,
              );
              return {
                types,
                items,
                // return `null` if there is no result, otherwise string
                getStringData(mediaType: string): string | null {
                  // not dragging the requested type
                  // return `null` (no result)
                  if (!types.includes(mediaType)) {
                    return null;
                  }

                  // nativeGetData will return `""` when there is no value,
                  // but at this point we know we will only get explicitly set
                  // values back as we have checked the `types`.
                  // `""` can be an explicitly set value.
                  const value = nativeGetData(mediaType);

                  // not exposing data for unavailable types
                  if (!isAnAvailableType({ type: mediaType, value })) {
                    return null;
                  }

                  return value;
                },
              };
            },
          },
        });
      },
    });
  },
});

/**
 * Some events don't make sense for the external adapter
 *
 * `onGenerateDragPreview`
 * The browser creates the drag preview for external drags, so we don't
 * need an event to generate the preview for _monitors_ or the _dropTarget_
 *
 * `onDragStart`
 * An external drag can never start from in the `window`, so _dropTarget_'s
 * don't need `onDragStart`
 */
type StripEventsForDropTargets<T> = Omit<
  T,
  'onGenerateDragPreview' | 'onDragStart'
>;
type StripEventsForMonitors<T> = Omit<T, 'onGenerateDragPreview'>;

export function dropTargetForExternal(
  args: StripEventsForDropTargets<Parameters<typeof adapter.dropTarget>[0]>,
): CleanupFn {
  // not removing unused events, just leaning on the type system
  return adapter.dropTarget(args);
}

export function monitorForExternal(
  args: StripEventsForMonitors<Parameters<typeof adapter.monitor>[0]>,
): CleanupFn {
  // not removing unused events, just leaning on the type system
  return adapter.monitor(args);
}

(function startup() {
  // server side rendering check
  if (typeof window === 'undefined') {
    return;
  }

  // A shared single usage registration as we want to capture
  // all external drag operations, even if there are no drop targets
  // on the page yet
  adapter.registerUsage();

  type State =
    | {
        type: 'idle';
      }
    | {
        type: 'dragging';
        cleanup: () => void;
      };

  // independent of pdnd, we need to keep track of
  // all drag operations so that we can know if a drag operation
  // has started locally

  const idle: State = { type: 'idle' };
  let state: State = idle;

  function clear() {
    if (state.type !== 'dragging') {
      return;
    }
    didDragStartLocally = false;
    state.cleanup();
    state = idle;
  }

  function bindEndEvents() {
    return bindAll(
      window,
      [
        {
          type: 'dragend',
          listener: clear,
        },
        ...getBindingsForBrokenDrags({ onDragEnd: clear }),
      ],
      // we want to make sure we get all the events,
      // and this helps avoid not seeing events when folks stop
      // them later on the event path
      { capture: true },
    );
  }

  // we always keep this event listener active
  bind(window, {
    type: 'dragstart',
    listener() {
      // something bad has happened if this is true!
      if (state.type !== 'idle') {
        return;
      }
      // set our global flag
      didDragStartLocally = true;

      state = {
        type: 'dragging',
        cleanup: bindEndEvents(),
      };
    },
    // binding in the capture phase so these listeners are called
    // before our listeners in the adapters `mount` function
    options: { capture: true },
  });
})();

/** Common event payload for all events */
export type ExternalEventBasePayload = BaseEventPayload<ExternalDragType>;

/** A map containing payloads for all events */
export type ExternalEventPayloadMap = StripEventsForMonitors<
  EventPayloadMap<ExternalDragType>
>;

/** Common event payload for all drop target events */
export type ElementDropTargetEventBasePayload =
  DropTargetEventBasePayload<ExternalDragType>;

/** A map containing payloads for all events on drop targets */
export type ExternalDropTargetEventPayloadMap = StripEventsForDropTargets<
  DropTargetEventPayloadMap<ExternalDragType>
>;

/** Arguments given to all feedback functions (eg `canDrop()`) on a `dropTargetForExternal` */
export type ExternalDropTargetGetFeedbackArgs =
  DropTargetGetFeedbackArgs<ExternalDragType>;

/** Arguments given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForExternal` */
export type ExternalMonitorGetFeedbackArgs =
  MonitorGetFeedbackArgs<ExternalDragType>;
