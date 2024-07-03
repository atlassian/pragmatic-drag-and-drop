import { bind } from 'bind-event-listener';

import { getElementFromPointWithoutHoneypot } from '../honey-pot-fix/get-element-from-point-without-honey-pot';
import { makeHoneyPotFix } from '../honey-pot-fix/make-honey-pot-fix';
import {
	type AdapterAPI,
	type AllEvents,
	type BaseEventPayload,
	type CleanupFn,
	type DropTargetEventBasePayload,
	type DropTargetEventPayloadMap,
	type DropTargetGetFeedbackArgs,
	type ElementDragType,
	type EventPayloadMap,
	type Input,
	type MonitorGetFeedbackArgs,
	type NativeMediaType,
} from '../internal-types';
import { makeAdapter } from '../make-adapter/make-adapter';
import { combine } from '../public-utils/combine';
import { addAttribute } from '../util/add-attribute';
import { androidFallbackText, isAndroid } from '../util/android';
import { getInput } from '../util/get-input';
import { textMediaType } from '../util/media-types/text-media-type';
import { urlMediaType } from '../util/media-types/url-media-type';

import { elementAdapterNativeDataKey } from './element-adapter-native-data-key';

type DraggableGetFeedbackArgs = {
	/**
	 * The user input as a drag is trying to start (the `initial` input)
	 */
	input: Input;
	/**
	 * The `draggable` element
	 */
	element: HTMLElement;
	/**
	 * The `dragHandle` element for the `draggable`
	 */
	dragHandle: Element | null;
};

type DraggableArgs = {
	/** The `HTMLElement` that you want to attach draggable behaviour to.
	 * `element` is our unique _key_ for a draggable.
	 * `element` is a `HTMLElement` as only a `HTMLElement`
	 * can have a "draggable" attribute
	 */
	element: HTMLElement;
	/** The part of a draggable `element` that you want to use to control the dragging of the whole `element` */
	dragHandle?: Element;
	/** Conditionally allow a drag to occur */
	canDrag?: (args: DraggableGetFeedbackArgs) => boolean;
	/** Used to attach data to a drag operation. Called once just before the drag starts */
	getInitialData?: (args: DraggableGetFeedbackArgs) => Record<string, unknown>;
	/** Attach data to the native drag data store.
	 * This function is useful to attach native data that can be extracted by other web pages
	 * or web applications
	 * Attaching native data in this way will _not_ cause the native adapter on this page to start
	 * Although it can cause a native adapter in other applications to start
	 * @example getInitialDataForExternal(() => ({'text/plain': item.description}))
	 * */
	getInitialDataForExternal?: (args: DraggableGetFeedbackArgs) => {
		// Ideally we would exclude `typeof elementAdapterNativeDataKey` from this
		// However, "deny listing" a string from a union doesn't work well with TS
		[Key in NativeMediaType]?: string;
	};
} & Partial<AllEvents<ElementDragType>>;

const draggableRegistry = new WeakMap<HTMLElement, DraggableArgs>();

function addToRegistry(args: DraggableArgs): CleanupFn {
	draggableRegistry.set(args.element, args);

	return function cleanup() {
		draggableRegistry.delete(args.element);
	};
}

const honeyPotFix = makeHoneyPotFix();

const adapter = makeAdapter<ElementDragType>({
	typeKey: 'element',
	defaultDropEffect: 'move',
	mount(api: AdapterAPI<ElementDragType>): CleanupFn {
		/**  Binding event listeners the `document` rather than `window` so that
		 * this adapter always gets preference over the text adapter.
		 * `document` is the first `EventTarget` under `window`
		 * https://twitter.com/alexandereardon/status/1604658588311465985
		 */
		return combine(
			honeyPotFix.bindEvents(),
			bind(document, {
				type: 'dragstart',
				listener(event: DragEvent) {
					if (!api.canStart(event)) {
						return;
					}

					// If the "dragstart" event is cancelled, then a drag won't start
					// There will be no further drag operation events (eg no "dragend" event)
					if (event.defaultPrevented) {
						return;
					}

					// Technically `dataTransfer` can be `null` according to the types
					// But that behaviour does not seem to appear in the spec.
					// If there is not `dataTransfer`, we can assume something is wrong and not
					// start a drag
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

					// the closest parent that is a draggable element will be marked as
					// the `event.target` for the event
					const target: EventTarget | null = event.target;

					// this source is only for elements
					// Note: only HTMLElements can have the "draggable" attribute
					if (!(target instanceof HTMLElement)) {
						return null;
					}

					// see if the thing being dragged is owned by us
					const entry: DraggableArgs | undefined = draggableRegistry.get(target);

					// no matching element found
					// → dragging an element with `draggable="true"` that is not controlled by us
					if (!entry) {
						return null;
					}

					const input: Input = getInput(event);

					const feedback: DraggableGetFeedbackArgs = {
						element: entry.element,
						dragHandle: entry.dragHandle ?? null,
						input,
					};

					// Check: does the draggable want to allow dragging?
					if (entry.canDrag && !entry.canDrag(feedback)) {
						// cancel drag operation if we cannot drag
						event.preventDefault();
						return null;
					}

					// Check: is there a drag handle and is the user using it?
					if (entry.dragHandle) {
						// technically don't need this util, but just being
						// consistent with how we look up what is under the users
						// cursor.
						const over = getElementFromPointWithoutHoneypot({
							x: input.clientX,
							y: input.clientY,
						});

						// if we are not dragging from the drag handle (or something inside the drag handle)
						// then we will cancel the active drag
						if (!entry.dragHandle.contains(over)) {
							event.preventDefault();
							return null;
						}
					}

					/**
					 *  **Goal**
					 *  Pass information to other applications
					 *
					 * **Approach**
					 *  Put data into the native data store
					 *
					 *  **What about the native adapter?**
					 *  When the element adapter puts native data into the native data store
					 *  the native adapter is not triggered in the current window,
					 *  but a native adapter in an external window _can_ be triggered
					 *
					 *  **Why bake this into core?**
					 *  This functionality could be pulled out and exposed inside of
					 *  `onGenerateDragPreview`. But decided to make it a part of the
					 *  base API as it felt like a common enough use case and ended
					 *  up being a similar amount of code to include this function as
					 *  it was to expose the hook for it
					 */
					const nativeData = entry.getInitialDataForExternal?.(feedback) ?? null;

					if (nativeData) {
						for (const [key, data] of Object.entries(nativeData)) {
							event.dataTransfer.setData(key, data ?? '');
						}
					}

					/**
					 *  📱 For Android devices, a drag operation will not start unless
					 * "text/plain" or "text/uri-list" data exists in the native data store
					 * https://twitter.com/alexandereardon/status/1732189803754713424
					 *
					 * Tested on:
					 * Device: Google Pixel 5
					 * Android version: 14 (November 5, 2023)
					 * Chrome version: 120.0
					 */
					const { types } = event.dataTransfer;
					if (isAndroid() && !types.includes(textMediaType) && !types.includes(urlMediaType)) {
						event.dataTransfer.setData(textMediaType, androidFallbackText);
					}

					/**
					 * 1. Must set any media type for `iOS15` to work
					 * 2. We are also doing adding data so that the native adapter
					 * can know that the element adapter has handled this drag
					 *
					 * We used to wrap this `setData()` in a `try/catch` for Firefox,
					 * but it looks like that was not needed.
					 *
					 * Tested using: https://codesandbox.io/s/checking-firefox-throw-behaviour-on-dragstart-qt8h4f
					 *
					 * - ✅ Firefox@70.0 (Oct 2019) on macOS Sonoma
					 * - ✅ Firefox@70.0 (Oct 2019) on macOS Big Sur
					 * - ✅ Firefox@70.0 (Oct 2019) on Windows 10
					 *
					 * // just checking a few more combinations to be super safe
					 *
					 * - ✅ Chrome@78 (Oct 2019) on macOS Big Sur
					 * - ✅ Chrome@78 (Oct 2019) on Windows 10
					 * - ✅ Safari@14.1 on macOS Big Sur
					 */
					event.dataTransfer.setData(elementAdapterNativeDataKey, '');

					const payload: ElementDragType['payload'] = {
						element: entry.element,
						dragHandle: entry.dragHandle ?? null,
						data: entry.getInitialData?.(feedback) ?? {},
					};

					const dragType: ElementDragType = {
						type: 'element',
						payload,
						startedFrom: 'internal',
					};

					api.start({
						event,
						dragType,
					});
				},
			}),
		);
	},
	dispatchEventToSource: <EventName extends keyof EventPayloadMap<ElementDragType>>({
		eventName,
		payload,
	}: {
		eventName: EventName;
		payload: EventPayloadMap<ElementDragType>[EventName];
	}) => {
		// During a drag operation, a draggable can be:
		// - remounted with different functions
		// - removed completely
		// So we need to get the latest entry from the registry in order
		// to call the latest event functions

		draggableRegistry.get(payload.source.element)?.[eventName]?.(
			// I cannot seem to get the types right here.
			// TS doesn't seem to like that one event can need `nativeSetDragImage`
			// @ts-expect-error
			payload,
		);
	},
	onPostDispatch: honeyPotFix.getOnPostDispatch(),
});

export const dropTargetForElements = adapter.dropTarget;
export const monitorForElements = adapter.monitor;

export function draggable(args: DraggableArgs): CleanupFn {
	// Guardrail: warn if the drag handle is not contained in draggable element
	if (process.env.NODE_ENV !== 'production') {
		if (args.dragHandle && !args.element.contains(args.dragHandle)) {
			// eslint-disable-next-line no-console
			console.warn('Drag handle element must be contained in draggable element', {
				element: args.element,
				dragHandle: args.dragHandle,
			});
		}
	}
	// Guardrail: warn if the draggable element is already registered
	if (process.env.NODE_ENV !== 'production') {
		const existing = draggableRegistry.get(args.element);
		if (existing) {
			// eslint-disable-next-line no-console
			console.warn('You have already registered a `draggable` on the same element', {
				existing,
				proposed: args,
			});
		}
	}

	return combine(
		// making the draggable register the adapter rather than drop targets
		// this is because you *must* have a draggable element to start a drag
		// but you _might_ not have any drop targets immediately
		// (You might create drop targets async)
		adapter.registerUsage(),
		addToRegistry(args),
		addAttribute(args.element, { attribute: 'draggable', value: 'true' }),
	);
}

/** Common event payload for all events */
export type ElementEventBasePayload = BaseEventPayload<ElementDragType>;

/** A map containing payloads for all events */
export type ElementEventPayloadMap = EventPayloadMap<ElementDragType>;

/** Common event payload for all drop target events */
export type ElementDropTargetEventBasePayload = DropTargetEventBasePayload<ElementDragType>;

/** A map containing payloads for all events on drop targets */
export type ElementDropTargetEventPayloadMap = DropTargetEventPayloadMap<ElementDragType>;

/** Arguments given to all feedback functions (eg `canDrag()`) on for a `draggable()` */
export type ElementGetFeedbackArgs = DraggableGetFeedbackArgs;

/** Arguments given to all feedback functions (eg `canDrop()`) on a `dropTargetForElements()` */
export type ElementDropTargetGetFeedbackArgs = DropTargetGetFeedbackArgs<ElementDragType>;

/** Arguments given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForElements` */
export type ElementMonitorGetFeedbackArgs = MonitorGetFeedbackArgs<ElementDragType>;
