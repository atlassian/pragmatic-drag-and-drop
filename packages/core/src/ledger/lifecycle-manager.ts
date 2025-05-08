import { bindAll } from 'bind-event-listener';

import { getElementFromPointWithoutHoneypot } from '../honey-pot-fix/get-element-from-point-without-honey-pot';
import { isHoneyPotElement } from '../honey-pot-fix/is-honey-pot-element';
import {
	type AllDragTypes,
	type DragLocation,
	type DropTargetAPI,
	type DropTargetRecord,
	type EventPayloadMap,
	type Input,
} from '../internal-types';
import { isLeavingWindow } from '../util/changing-window/is-leaving-window';
import { getBindingsForBrokenDrags } from '../util/detect-broken-drag';
import { getInput } from '../util/get-input';

import { makeDispatch } from './dispatch-consumer-event';

const globalState = {
	isActive: false,
};

function canStart(): boolean {
	return !globalState.isActive;
}

function getNativeSetDragImage(event: DragEvent): DataTransfer['setDragImage'] | null {
	if (event.dataTransfer) {
		// need to use `.bind` as `setDragImage` is required
		// to be run with `event.dataTransfer` as the "this" context
		return event.dataTransfer.setDragImage.bind(event.dataTransfer);
	}
	return null;
}

function hasHierarchyChanged({
	current,
	next,
}: {
	current: DropTargetRecord[];
	next: DropTargetRecord[];
}): boolean {
	if (current.length !== next.length) {
		return true;
	}
	// not checking stickiness, data or dropEffect,
	// just whether the hierarchy has changed
	for (let i = 0; i < current.length; i++) {
		if (current[i].element !== next[i].element) {
			return true;
		}
	}
	return false;
}

function start<DragType extends AllDragTypes>({
	event,
	dragType,
	getDropTargetsOver,
	dispatchEvent,
}: {
	event: DragEvent;
	dragType: DragType;
	getDropTargetsOver: DropTargetAPI<DragType>['getIsOver'];
	dispatchEvent: <EventName extends keyof EventPayloadMap<DragType>>(args: {
		eventName: EventName;
		payload: EventPayloadMap<DragType>[EventName];
	}) => void;
}): void {
	if (!canStart()) {
		return;
	}
	const initial: DragLocation = getStartLocation({
		event,
		dragType,
		getDropTargetsOver,
	});

	globalState.isActive = true;

	type LocalState = {
		current: DragLocation;
	};

	const state: LocalState = {
		current: initial,
	};

	// Setting initial drop effect for the drag
	setDropEffectOnEvent({ event, current: initial.dropTargets });

	const dispatch = makeDispatch<DragType>({
		source: dragType.payload,
		dispatchEvent,
		initial,
	});

	function updateState(next: DragLocation) {
		// only looking at whether hierarchy has changed to determine whether something as 'changed'
		const hasChanged = hasHierarchyChanged({
			current: state.current.dropTargets,
			next: next.dropTargets,
		});

		// Always updating the state to include latest data, dropEffect and stickiness
		// Only updating consumers if the hierarchy has changed in some way
		// Consumers can get the latest data by using `onDrag`
		state.current = next;

		if (hasChanged) {
			dispatch.dragUpdate({
				current: state.current,
			});
		}
	}

	function onUpdateEvent(event: DragEvent) {
		const input: Input = getInput(event);

		// If we are over the honey pot, we need to get the element
		// that the user would have been over if not for the honey pot
		const target = isHoneyPotElement(event.target)
			? getElementFromPointWithoutHoneypot({ x: input.clientX, y: input.clientY })
			: event.target;

		const nextDropTargets = getDropTargetsOver({
      target,
      event,
      input,
      source: dragType.payload,
      current: state.current.dropTargets,
    });

		if (nextDropTargets.length) {
			// 🩸 must call `event.preventDefault()` to allow a browser drop to occur
			event.preventDefault();
			setDropEffectOnEvent({ event, current: nextDropTargets });
		}

		updateState({ dropTargets: nextDropTargets, input });
	}

	function cancel() {
		// The spec behaviour is that when a drag is cancelled, or when dropping on no drop targets,
		// a "dragleave" event is fired on the active drop target before a "dragend" event.
		// We are replicating that behaviour in `cancel` if there are any active drop targets to
		// ensure consistent behaviour.
		//
		// Note: When cancelling, or dropping on no drop targets, a "dragleave" event
		// will have already cleared the dropTargets to `[]` (as that particular "dragleave" has a `relatedTarget` of `null`)

		if (state.current.dropTargets.length) {
			updateState({ dropTargets: [], input: state.current.input });
		}

		dispatch.drop({
			current: state.current,
			updatedSourcePayload: null,
		});

		finish();
	}

	function finish() {
		globalState.isActive = false;
		unbindEvents();
	}

	const unbindEvents = bindAll(
		window,
		[
			{
				// 👋 Note: we are repurposing the `dragover` event as our `drag` event
				// this is because firefox does not publish pointer coordinates during
				// a `drag` event, but does for every other type of drag event
				// `dragover` fires on all elements that are being dragged over
				// Because we are binding to `window` - our `dragover` is effectively the same as a `drag`
				// 🦊😤
				type: 'dragover',
				listener(event: DragEvent) {
					// We need to regularly calculate the drop targets in order to allow:
					//  - dynamic `canDrop()` checks
					//  - rapid updating `getData()` calls to attach data in response to user input (eg for edge detection)
					// Sadly we cannot schedule inspecting changes resulting from this event
					// we need to be able to conditionally cancel the event with `event.preventDefault()`
					// to enable the correct native drop experience.

					// 1. check to see if anything has changed
					onUpdateEvent(event);

					// 2. let consumers know a move has occurred
					// This will include the latest 'input' values
					dispatch.drag({
						current: state.current,
					});
				},
			},
			{
				type: 'dragenter',
				listener: onUpdateEvent,
			},

			{
				type: 'dragleave',
				listener(event: DragEvent) {
					if (!isLeavingWindow({ dragLeave: event })) {
						return;
					}

					/**
					 * At this point we don't know if a drag is being cancelled,
					 * or if a drag is leaving the `window`.
					 *
					 * Both have:
					 *   1. "dragleave" (with `relatedTarget: null`)
					 *   2. "dragend" (a "dragend" can occur when outside the `window`)
					 *
					 * **Clearing drop targets**
					 *
					 * For either case we are clearing the the drop targets
					 *
					 * - cancelling: we clear drop targets in `"dragend"` anyway
					 * - leaving the `window`: we clear the drop targets (to clear stickiness)
					 *
					 * **Leaving the window and finishing the drag**
					 *
					 * _internal drags_
					 *
					 * - The drag continues when the user is outside the `window`
					 *   and can resume if the user drags back over the `window`,
					 *   or end when the user drops in an external `window`.
					 * - We will get a `"dragend"`, or we can listen for other
					 *   events to determine the drag is finished when the user re-enters the `window`).
					 *
					 * _external drags_
					 *
					 * - We conclude the drag operation.
					 * - We have no idea if the user will drag back over the `window`,
					 *   or if the drag ends elsewhere.
					 * - We will create a new drag if the user re-enters the `window`.
					 *
					 * **Not updating `input`**
					 *
					 * 🐛 Bug[Chrome] the final `"dragleave"` has default input values (eg `clientX == 0`)
					 * Workaround: intentionally not updating `input` in "dragleave"
					 * rather than the users current input values
					 * - [Conversation](https://twitter.com/alexandereardon/status/1642697633864241152)
					 * - [Bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1429937)
					 **/

					updateState({ input: state.current.input, dropTargets: [] });

					if (dragType.startedFrom === 'external') {
						cancel();
					}
				},
			},
			{
				// A "drop" can only happen if the browser allowed the drop
				type: 'drop',
				listener(event: DragEvent) {
					// Capture the final input.
					// We are capturing the final `input` for the
					// most accurate honey pot experience
					state.current = {
						dropTargets: state.current.dropTargets,
						input: getInput(event),
					};

					/** If there are no drop targets, then we will get
					 * a "drop" event if:
					 * - `preventUnhandled()` is being used
					 * - there is an unmanaged drop target (eg another library)
					 * In these cases, it's up to the consumer
					 * to handle the drop if it's not over one of our drop targets
					 * - `preventUnhandled()` will cancel the "drop"
					 * - unmanaged drop targets can handle the "drop" how they want to
					 * We won't call `event.preventDefault()` in this call path */

					if (!state.current.dropTargets.length) {
						cancel();
						return;
					}

					event.preventDefault();

					// applying the latest drop effect to the event
					setDropEffectOnEvent({ event, current: state.current.dropTargets });

					dispatch.drop({
						current: state.current,
						// When dropping something native, we need to extract the latest
						// `.items` from the "drop" event as it is now accessible
						updatedSourcePayload:
							dragType.type === 'external' ? dragType.getDropPayload(event) : null,
					});

					finish();
				},
			},
			{
				// "dragend" fires when on the drag source (eg a draggable element)
				// when the drag is finished.
				// "dragend" will fire after "drop" (if there was a successful drop)
				// "dragend" does not fire if the draggable source has been removed during the drag
				// or for external drag sources (eg files)

				// This "dragend" listener will not fire if there was a successful drop
				// as we will have already removed the event listener

				type: 'dragend',
				listener(event: DragEvent) {
					// In firefox, the position of the "dragend" event can
					// be a bit different to the last "dragover" event.
					// Updating the input so we can get the best possible
					// information for the honey pot.
					state.current = {
						dropTargets: state.current.dropTargets,
						input: getInput(event),
					};
					cancel();
				},
			},
			...getBindingsForBrokenDrags({
				onDragEnd: cancel,
			}),
		],
		// Once we have started a managed drag operation it is important that we see / own all drag events
		// We got one adoption bug pop up where some code was stopping (`event.stopPropagation()`)
		// all "drop" events in the bubble phase on the `document.body`.
		// This meant that we never saw the "drop" event.
		{ capture: true },
	);

	dispatch.start({
		nativeSetDragImage: getNativeSetDragImage(event),
	});
}

function setDropEffectOnEvent({
	event,
	current,
}: {
	event: DragEvent;
	current: DropTargetRecord[];
}) {
	// setting the `dropEffect` to be the innerMost drop targets dropEffect
	const innerMost = current[0]?.dropEffect;
	if (innerMost != null && event.dataTransfer) {
		event.dataTransfer.dropEffect = innerMost;
	}
}

function getStartLocation<DragType extends AllDragTypes>({
	event,
	dragType,
	getDropTargetsOver,
}: {
	event: DragEvent;
	dragType: DragType;
	getDropTargetsOver: DropTargetAPI<DragType>['getIsOver'];
}): DragLocation {
	const input: Input = getInput(event);

	// When dragging from outside of the browser,
	// the drag is not being sourced from any local drop targets
	if (dragType.startedFrom === 'external') {
		return {
			input,
			dropTargets: [],
		};
	}

	const dropTargets: DropTargetRecord[] = getDropTargetsOver({
		input,
		source: dragType.payload,
		target: event.target,
		event,
		current: [],
	});
	return {
		input,
		dropTargets,
	};
}

export const lifecycle = {
	canStart,
	start,
};
