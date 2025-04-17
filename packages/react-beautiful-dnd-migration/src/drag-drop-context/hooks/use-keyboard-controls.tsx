import { useCallback } from 'react';

import { bindAll, type Binding } from 'bind-event-listener';
import type { Direction } from 'react-beautiful-dnd';

import type { CleanupFn } from '../../internal-types';
import { attributes, customAttributes, getAttribute } from '../../utils/attributes';
import { findClosestScrollContainer } from '../../utils/find-closest-scroll-container';
import { getElement } from '../../utils/find-element';
import { getBestCrossAxisDroppable } from '../../utils/get-best-cross-axis-droppable';
import { getElementByDraggableLocation } from '../../utils/get-element-by-draggable-location';
import { isSameLocation } from '../draggable-location';
import type { DroppableRegistry } from '../droppable-registry';
import { getActualDestination } from '../get-destination';
import { rbdInvariant } from '../rbd-invariant';
import type { DragController, StartKeyboardDrag } from '../types';

type KeyHandlerData = {
	dragController: DragController;
	droppableRegistry: DroppableRegistry;
	contextId: string;
};

type KeyHandler = (event: KeyboardEvent, data: KeyHandlerData) => void;

/**
 * Finds the element's scroll container and scrolls it to the top.
 *
 * This is used for cross-axis drags to provide a consistent starting point
 * in the list.
 *
 * The behavior differs to `react-beautiful-dnd` which would find the
 * index closest to the current visual position. That was not preserved for
 * performance cost reasons.
 */
function scrollToTop(element: HTMLElement): void {
	const scrollContainer = findClosestScrollContainer(element);
	if (!scrollContainer) {
		return;
	}
	scrollContainer.scrollTo(0, 0);
}

const moveHandlers: Record<'mainAxis' | 'crossAxis', Record<'prev' | 'next', KeyHandler>> = {
	mainAxis: {
		prev(event: KeyboardEvent, { dragController }: KeyHandlerData) {
			/**
			 * Preventing default to stop scrolling caused by arrow key press.
			 */
			event.preventDefault();

			const dragState = dragController.getDragState();
			rbdInvariant(dragState.isDragging);

			const { sourceLocation, targetLocation } = dragState;

			if (!targetLocation) {
				return;
			}

			if (targetLocation.index === 0) {
				return;
			}

			const nextLocation = {
				...targetLocation,
				index: targetLocation.index - 1,
			};

			const nextDestination = getActualDestination({
				start: sourceLocation,
				target: nextLocation,
			});

			/**
			 * There are two target indexes that correspond to a drop in the source location:
			 *
			 * 1. source.index      (before the source, but after previous item)
			 * 2. source.index + 1  (after the source, but before next item)
			 *
			 * We decrement by 2 when going over the source location,
			 * so the user only perceives one of these indexes.
			 */
			if (isSameLocation(sourceLocation, nextDestination)) {
				nextLocation.index = targetLocation.index - 2;
			}

			dragController.updateDrag({ targetLocation: nextLocation });
		},
		next(event: KeyboardEvent, { dragController, contextId }: KeyHandlerData) {
			/**
			 * Preventing default to stop scrolling caused by arrow key press.
			 */
			event.preventDefault();

			const dragState = dragController.getDragState();
			rbdInvariant(dragState.isDragging);

			const { sourceLocation, targetLocation } = dragState;
			if (!targetLocation) {
				return;
			}

			/**
			 * Checks if we can move to the next position.
			 *
			 * Reasoning: if there is already a draggable with the current index,
			 * then it is a possible target.
			 */
			const element = getElementByDraggableLocation(contextId, targetLocation);
			/**
			 * This check is for virtual lists, and is a special case.
			 *
			 * When dragging, the element will unmount and we won't be able to find
			 * the element for that index.
			 *
			 * This means for virtual lists, the normal check (element check) will fail.
			 */
			const isSame = isSameLocation(sourceLocation, targetLocation);
			if (!isSame && !element) {
				return;
			}

			const nextLocation = {
				...targetLocation,
				index: targetLocation.index + 1,
			};

			const nextDestination = getActualDestination({
				start: sourceLocation,
				target: nextLocation,
			});

			/**
			 * There are two target indexes that correspond to a drop in the source location:
			 *
			 * 1. source.index      (before the source, but after previous item)
			 * 2. source.index + 1  (after the source, but before next item)
			 *
			 * We increment by 2 when going over the source location,
			 * so the user only perceives one of these indexes.
			 */
			if (isSameLocation(sourceLocation, nextDestination)) {
				nextLocation.index = targetLocation.index + 2;
			}

			dragController.updateDrag({ targetLocation: nextLocation });
		},
	},
	crossAxis: {
		prev(event: KeyboardEvent, { dragController, droppableRegistry, contextId }: KeyHandlerData) {
			/**
			 * Preventing default to stop scrolling caused by arrow key press.
			 */
			event.preventDefault();

			const dragState = dragController.getDragState();
			rbdInvariant(dragState.isDragging);

			const { targetLocation, type } = dragState;

			if (!targetLocation) {
				return;
			}

			const before = getBestCrossAxisDroppable({
				droppableId: targetLocation.droppableId,
				type,
				isMovingForward: false,
				contextId,
				droppableRegistry,
			});

			if (!before) {
				return;
			}

			scrollToTop(before);

			const nextLocation = {
				droppableId: getAttribute(before, attributes.droppable.id),
				index: 0,
			};

			dragController.updateDrag({ targetLocation: nextLocation });
		},
		next(event: KeyboardEvent, { dragController, droppableRegistry, contextId }: KeyHandlerData) {
			/**
			 * Preventing default to stop scrolling caused by arrow key press.
			 */
			event.preventDefault();

			const dragState = dragController.getDragState();
			rbdInvariant(dragState.isDragging);

			const { targetLocation, type } = dragState;

			if (!targetLocation) {
				return;
			}

			const after = getBestCrossAxisDroppable({
				droppableId: targetLocation.droppableId,
				type,
				isMovingForward: true,
				contextId,
				droppableRegistry,
			});

			if (!after) {
				return;
			}

			scrollToTop(after);

			const nextLocation = {
				droppableId: getAttribute(after, attributes.droppable.id),
				index: 0,
			};

			dragController.updateDrag({ targetLocation: nextLocation });
		},
	},
};

function preventDefault(event: Event) {
	event.preventDefault();
}

/**
 * These keys mostly have their default behavior prevented to stop scrolling.
 *
 * The tab key is prevented to lock focus in place.
 */
const commonKeyHandlers = {
	PageUp: preventDefault,
	PageDown: preventDefault,
	Home: preventDefault,
	End: preventDefault,
	Enter: preventDefault,
	Tab: preventDefault,
};

/**
 * Maps actions to keys.
 */
const keyHandlers: Record<Direction, Record<string, KeyHandler>> = {
	vertical: {
		...commonKeyHandlers,
		ArrowUp: moveHandlers.mainAxis.prev,
		ArrowDown: moveHandlers.mainAxis.next,
		ArrowLeft: moveHandlers.crossAxis.prev,
		ArrowRight: moveHandlers.crossAxis.next,
	},
	horizontal: {
		...commonKeyHandlers,
		ArrowUp: moveHandlers.crossAxis.prev,
		ArrowDown: moveHandlers.crossAxis.next,
		ArrowLeft: moveHandlers.mainAxis.prev,
		ArrowRight: moveHandlers.mainAxis.next,
	},
};

export function useKeyboardControls({
	dragController,
	droppableRegistry,
	contextId,
	setKeyboardCleanupFn,
}: {
	dragController: DragController;
	droppableRegistry: DroppableRegistry;
	contextId: string;
	/**
	 * Sets the cleanup function that should run whenever:
	 * - A user drops
	 * - A user cancels a drag
	 * - There is an error, cancelling a drag
	 *
	 * Because this hook has no visibility of when a drag is cancelled due to
	 * an error, the cleanup is handled at the level above.
	 */
	setKeyboardCleanupFn: (cleanupFn: CleanupFn) => void;
}): { startKeyboardDrag: StartKeyboardDrag } {
	const startKeyboardDrag: StartKeyboardDrag = useCallback(
		({ event: startEvent, draggableId, type, getSourceLocation, sourceElement }) => {
			dragController.startDrag({
				draggableId,
				type,
				getSourceLocation,
				sourceElement,
				mode: 'SNAP',
			});

			const sourceLocation = getSourceLocation();

			const droppable = getElement({
				attribute: attributes.droppable.id,
				value: sourceLocation.droppableId,
			});

			const direction = getAttribute(droppable, customAttributes.droppable.direction);

			rbdInvariant(direction === 'vertical' || direction === 'horizontal');

			function cancelDrag() {
				dragController.stopDrag({ reason: 'CANCEL' });
			}

			/**
			 * All of these events should cancel the drag.
			 *
			 * These events were taken from `react-beautiful-dnd`.
			 */
			const cancelBindings: Binding[] = [
				'mousedown',
				'mouseup',
				'click',
				'touchstart',
				'resize',
				'wheel',
				'visibilitychange',
			].map((type) => {
				return { type, listener: cancelDrag };
			});

			const cleanupFn = bindAll(window, [
				{
					type: 'keydown',
					listener(event: KeyboardEvent) {
						/**
						 * Ignores the keydown event which triggered the drag start,
						 * so it doesn't trigger an immediate drop.
						 */
						if (event === startEvent) {
							return;
						}

						const { isDragging } = dragController.getDragState();
						if (!isDragging) {
							return;
						}

						if (event.key === ' ') {
							event.preventDefault();
							dragController.stopDrag({ reason: 'DROP' });
							return;
						}

						if (event.key === 'Escape') {
							event.preventDefault();
							dragController.stopDrag({ reason: 'CANCEL' });
							return;
						}

						keyHandlers[direction][event.key]?.(event, {
							dragController,
							droppableRegistry,
							contextId,
						});
					},
				},
				...cancelBindings,
			]);

			setKeyboardCleanupFn(cleanupFn);
		},
		[contextId, dragController, droppableRegistry, setKeyboardCleanupFn],
	);

	return { startKeyboardDrag };
}
