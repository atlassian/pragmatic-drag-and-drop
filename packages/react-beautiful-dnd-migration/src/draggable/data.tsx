import { useMemo } from 'react';

import type { DraggableId, DroppableId } from 'react-beautiful-dnd';

/**
 * Private symbol that is intentionally not exported from this file.
 */
const privateKey = Symbol('DraggableData');

/**
 * Data that is attached to drags. The same data is used for the `draggable()`
 * and `dropTargetForElements()` calls related to a `<Draggable>` instance.
 */
export type DraggableData = {
	/**
	 * Indicates this data is for a `<Draggable>` instance.
	 */
	[privateKey]: true;

	/**
	 * The `draggableId` of the `<Draggable>` instance.
	 */
	draggableId: DraggableId;
	/**
	 * Lazily returns the `index` of the `<Draggable>` instance.
	 *
	 * This is a function because the `index` can change during a drag.
	 */
	getIndex: () => number;
	/**
	 * The `droppableId` of the containing `<Droppable>` instance.
	 */
	droppableId: DroppableId;
	/**
	 * The `type` of the containing `<Droppable>` instance.
	 */
	type: string;

	contextId: string;
};

/**
 * Checks if the passed data satisfies `DraggableData` using the private symbol.
 */
export function isDraggableData(data: Record<string | symbol, unknown>): data is DraggableData {
	return data[privateKey] === true;
}

/**
 * Adds the private symbol to the passed data.
 *
 * The symbol allows us to quickly check if an object satisfies `DraggableData`.
 */
export function useDraggableData({
	draggableId,
	droppableId,
	getIndex,
	contextId,
	type,
}: Omit<DraggableData, symbol>): DraggableData {
	return useMemo(() => {
		return {
			[privateKey]: true,
			draggableId,
			droppableId,
			getIndex,
			contextId,
			type,
		};
	}, [draggableId, droppableId, getIndex, contextId, type]);
}
