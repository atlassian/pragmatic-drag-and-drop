import { useMemo } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type { DraggableStateSnapshot, DroppableId, MovementMode } from 'react-beautiful-dnd';

export function useDraggableStateSnapshot({
	draggingOver,
	isClone,
	isDragging,
	mode,
}: {
	draggingOver: DroppableId | null;
	isClone: boolean;
	isDragging: boolean;
	mode: MovementMode | null;
}): DraggableStateSnapshot {
	return useMemo(
		() => ({
			isClone,
			isDragging,
			draggingOver,
			mode,
			/**
			 * The properties below are fixed in the migration layer,
			 * because they are not supported.
			 *
			 * Animation and combination were intentionally removed.
			 */
			isDropAnimating: false,
			dropAnimation: null,
			combineWith: null,
			combineTargetFor: null,
		}),
		[draggingOver, isClone, isDragging, mode],
	);
}
