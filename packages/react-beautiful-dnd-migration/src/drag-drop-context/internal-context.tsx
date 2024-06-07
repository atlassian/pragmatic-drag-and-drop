import React, { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { DroppableRegistry } from './droppable-registry';
import { rbdInvariant } from './rbd-invariant';
import type { DragState, StartKeyboardDrag } from './types';

type DragDropContextValue = {
	/**
	 * A stringified number used to uniquely identify each context instance.
	 * This allows each <DragDropContext /> to be isolated from each other.
	 *
	 * This is the approach originally used by `react-beautiful-dnd`.
	 */
	contextId: string;

	/**
	 * Lazily returns the current drag state.
	 */
	getDragState(): DragState;

	startKeyboardDrag: StartKeyboardDrag;

	droppableRegistry: DroppableRegistry;
};

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function useDragDropContext() {
	const value = useContext(DragDropContext);
	rbdInvariant(value !== null, 'Unable to find DragDropContext context');
	return value;
}

export function DragDropContextProvider({
	children,
	contextId,
	getDragState,
	startKeyboardDrag,
	droppableRegistry,
}: {
	children: ReactNode;
	contextId: string;
	getDragState(): DragState;
	startKeyboardDrag: StartKeyboardDrag;
	droppableRegistry: DroppableRegistry;
}) {
	const value: DragDropContextValue = useMemo(() => {
		return {
			contextId,
			getDragState,
			startKeyboardDrag,
			droppableRegistry,
		};
	}, [contextId, getDragState, startKeyboardDrag, droppableRegistry]);

	return <DragDropContext.Provider value={value}>{children}</DragDropContext.Provider>;
}
