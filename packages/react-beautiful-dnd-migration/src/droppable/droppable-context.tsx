import { createContext, useContext } from 'react';

import type { Direction, DroppableMode } from 'react-beautiful-dnd';

import { rbdInvariant } from '../drag-drop-context/rbd-invariant';

export type DroppableContextProps = {
	direction: Direction;
	droppableId: string;
	shouldRenderCloneWhileDragging: boolean;
	isDropDisabled: boolean;
	type: string;
	mode: DroppableMode;
};

const DroppableContext = createContext<DroppableContextProps | null>(null);

export const DroppableContextProvider = DroppableContext.Provider;

/**
 * Intended for use by `<Draggable>` instances.
 */
export function useDroppableContext() {
	const value = useContext(DroppableContext);
	rbdInvariant(value, 'Missing <Droppable /> parent');

	return value;
}

/**
 * Returns the `droppableId` of the parent droppable, if there is one.
 *
 * Intended for use only by `<Droppable>` instances.
 */
export function useParentDroppableId() {
	const parentDroppable = useContext(DroppableContext);
	if (!parentDroppable) {
		return null;
	}

	return parentDroppable.droppableId;
}
