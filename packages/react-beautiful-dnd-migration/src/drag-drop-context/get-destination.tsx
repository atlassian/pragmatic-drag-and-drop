// eslint-disable-next-line import/no-extraneous-dependencies
import type { DraggableLocation } from 'react-beautiful-dnd';

/**
 * Calculates the actual destination of an item based on its start location
 * and target location.
 *
 * The actual destination may not be the same as the target location.
 * An item moving to a higher index in the same list introduces an
 * off-by-one error that this function accounts for.
 */
export function getActualDestination({
	start,
	target,
}: {
	/**
	 * The start location of the draggable.
	 */
	start: DraggableLocation;
	/**
	 * Where the drop indicator is being drawn.
	 */
	target: DraggableLocation | null;
}): DraggableLocation | null {
	if (target === null) {
		return null;
	}

	/**
	 * When reordering an item to an index greater than its current index
	 * in the same list, then the target index needs adjustment.
	 *
	 * This is to account for the item itself moving, which would cause a shift.
	 */
	const isSameList = start.droppableId === target.droppableId;
	const isMovingForward = target.index > start.index;
	const shouldAdjust = isSameList && isMovingForward;

	/**
	 * A clone is returned, even though it is the same value.
	 * This is because the returned object might be mutated.
	 */
	if (!shouldAdjust) {
		return { ...target };
	}

	return {
		...target,
		index: target.index - 1,
	};
}
