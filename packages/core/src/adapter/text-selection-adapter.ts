import { bind } from 'bind-event-listener';

import { makeHoneyPotFix } from '../honey-pot-fix/make-honey-pot-fix';
import {
	type AdapterAPI,
	type BaseEventPayload,
	type CleanupFn,
	type DropTargetEventBasePayload,
	type DropTargetEventPayloadMap,
	type DropTargetGetFeedbackArgs,
	type EventPayloadMap,
	type MonitorGetFeedbackArgs,
	type TextSelectionDragPayload,
	type TextSelectionDragType,
} from '../internal-types';
import { makeAdapter } from '../make-adapter/make-adapter';
import { combine } from '../public-utils/combine';
import { isSafari } from '../util/is-safari';
import { HTMLMediaType } from '../util/media-types/html-media-type';
import { textMediaType } from '../util/media-types/text-media-type';

import { elementAdapterNativeDataKey } from './element-adapter-native-data-key';

function findTextNode(event: DragEvent): Text | null {
	// Standard: the `event.target` should be the closest `Text` node.
	if (event.target instanceof Text) {
		return event.target;
	}

	// Structuring things this way so that if Safari fixes their bug
	// then the standard check will start working
	if (!isSafari()) {
		return null;
	}

	/**
	 * According to the spec, `event.target` should be the `Text` node that
	 * the drag started from when dragging a text selection.
	 *
	 * → https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model
	 *
	 * However, in Safari the closest `HTMLElement` is returned.
	 * So we need to figure out if text is dragging ourselves.
	 *
	 * → https://bugs.webkit.org/show_bug.cgi?id=268959
	 */
	if (!(event.target instanceof HTMLElement)) {
		return null;
	}

	// unlikely that this particular drag is a text selection drag
	if (event.target.draggable) {
		return null;
	}

	// if the drag contains no text data, then not dragging selected text
	// return `null` if there is no dataTransfer, or if `getData()` returns ""
	if (!event.dataTransfer?.getData(textMediaType)) {
		return null;
	}

	// Grab the first Text node and use that
	const text: Text | undefined = Array.from(event.target.childNodes).find(
		(node): node is Text => node.nodeType === Node.TEXT_NODE,
	);

	return text ?? null;
}

const honeyPotFix = makeHoneyPotFix();

const adapter = makeAdapter<TextSelectionDragType>({
	typeKey: 'text-selection',
	// for text selection, we will usually be making a copy of the text
	defaultDropEffect: 'copy',
	mount(api: AdapterAPI<TextSelectionDragType>): CleanupFn {
		// Binding to the `window` so that the element adapter has a
		// chance to get in first on the `document`.
		// We are giving preference to the element adapter.
		return combine(
			honeyPotFix.bindEvents(),
			bind(window, {
				type: 'dragstart',
				listener(event: DragEvent) {
					// If the "dragstart" event is cancelled, then a drag won't start
					// There will be no further drag operation events (eg no "dragend" event)
					if (event.defaultPrevented) {
						return;
					}

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

                - If you are unit testing, ensure you have polyfilled DragEvent.
                - If you are browser testing, ensure you are dispatching drag events correctly.

                Please see our testing guides for more information:
                https://atlassian.design/components/pragmatic-drag-and-drop/core-package/testing
              `.replace(/ {2}/g, ''),
							);
						}
						return;
					}

					// Drag is being handled by the element adapter
					if (event.dataTransfer.types.includes(elementAdapterNativeDataKey)) {
						return;
					}

					// Something else is handling this drag
					if (!api.canStart(event)) {
						return;
					}

					const target: Text | null = findTextNode(event);

					if (!target) {
						return;
					}

					const payload: TextSelectionDragPayload = {
						// The `Text` node that is the `target` is the `Text` node
						// that the user started the drag from.
						// The full text being dragged can be looked up from the `dataTransfer`.
						target,
						// This is safe to do in "dragstart" as the `dataTransfer` is in read/write mode.
						plain: event.dataTransfer.getData(textMediaType),
						HTML: event.dataTransfer.getData(HTMLMediaType),
					};

					api.start({
						event,
						dragType: {
							type: 'text-selection',
							startedFrom: 'internal',
							payload,
						},
					});
				},
			}),
		);
	},
	onPostDispatch: honeyPotFix.getOnPostDispatch(),
});

// The `onGenerateDragPreview` does not make sense to publish for text selection
// as the browser is completely in control of the drag preview
type StripPreviewEvent<T> = Omit<T, 'onGenerateDragPreview'>;

export function dropTargetForTextSelection(
	args: StripPreviewEvent<Parameters<typeof adapter.dropTarget>[0]>,
): CleanupFn {
	// note: not removing `onGenerateDragPreview`; just leaning on the type system
	return adapter.dropTarget(args);
}

// A shared single usage registration as any text can be dragged at any time
(function register() {
	// server side rendering check
	if (typeof window === 'undefined') {
		return;
	}
	adapter.registerUsage();
})();

export function monitorForTextSelection(
	args: StripPreviewEvent<Parameters<typeof adapter.monitor>[0]>,
): CleanupFn {
	// note: not removing `onGenerateDragPreview`; just leaning on the type system
	return adapter.monitor(args);
}

/** Common event payload for all events */
export type TextSelectionEventBasePayload = BaseEventPayload<TextSelectionDragType>;

/** A map containing payloads for all events */
export type TextSelectionEventPayloadMap = StripPreviewEvent<
	EventPayloadMap<TextSelectionDragType>
>;

/** Common event payload for all drop target events */
export type TextSelectionDropTargetEventBasePayload =
	DropTargetEventBasePayload<TextSelectionDragType>;

/** A map containing payloads for all events on drop targets */
export type TextSelectionDropTargetEventPayloadMap = StripPreviewEvent<
	DropTargetEventPayloadMap<TextSelectionDragType>
>;

/** Argument given to all feedback functions (eg `canDrop()`) on a `dropTargetForExternal` */
export type TextSelectionMonitorGetFeedbackArgs = MonitorGetFeedbackArgs<TextSelectionDragType>;

/** Argument given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForExternal` */
export type TextSelectionDropTargetGetFeedbackArgs =
	DropTargetGetFeedbackArgs<TextSelectionDragType>;
