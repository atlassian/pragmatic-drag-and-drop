import { useMemo } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type { DroppableId } from 'react-beautiful-dnd';

/**
 * Private symbol that is intentionally not exported from this file.
 */
const privateKey = Symbol('DroppableData');

/**
 * Data that is attached to drags.
 */
export type DroppableData = {
	/**
	 * Indicates this data is for a `<Droppable>` instance.
	 */
	[privateKey]: true;

	/**
	 * The `droppableId` of the `<Droppable>` instance.
	 */
	droppableId: DroppableId;

	/**
	 * Lazily returns whether the droppable is disabled.
	 */
	getIsDropDisabled(): boolean;

	contextId: string;
};

/**
 * Checks if the passed data satisfies `DroppableData` using the private symbol.
 */
export function isDroppableData(data: Record<string | symbol, unknown>): data is DroppableData {
	return data[privateKey] === true;
}

/**
 * Adds the private symbol to the passed data.
 *
 * The symbol allows us to quickly check if an object satisfies `DroppableData`.
 */
export function useDroppableData({
	contextId,
	droppableId,
	getIsDropDisabled,
}: Omit<DroppableData, symbol>): DroppableData {
	return useMemo(() => {
		return {
			[privateKey]: true,
			contextId,
			droppableId,
			getIsDropDisabled,
		};
	}, [contextId, droppableId, getIsDropDisabled]);
}
