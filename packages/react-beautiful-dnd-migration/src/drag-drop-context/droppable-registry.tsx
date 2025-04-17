import { useState } from 'react';

import type { Direction, DroppableId, DroppableMode } from 'react-beautiful-dnd';

import type { CleanupFn } from '../internal-types';

export type DroppableRegistryEntry = {
	droppableId: DroppableId;
	isDropDisabled: boolean;
	parentDroppableId: DroppableId | null;
	type: string;
	element: HTMLElement;
	direction: Direction;
	mode: DroppableMode;
};

type Register = (entry: DroppableRegistryEntry) => CleanupFn;

export type GetEntry = ({
	droppableId,
}: {
	droppableId: DroppableId;
}) => DroppableRegistryEntry | null;

type UpdateListener = (entry: DroppableRegistryEntry) => void;

type SetUpdateListener = (updateListener: UpdateListener) => void;

export type DroppableRegistry = {
	getEntry: GetEntry;
	register: Register;
	setUpdateListener: SetUpdateListener;
};

function createDroppableRegistry() {
	const droppableMap = new Map<DroppableId, DroppableRegistryEntry>();

	const getEntry: GetEntry = ({ droppableId }: { droppableId: DroppableId }) => {
		return droppableMap.get(droppableId) ?? null;
	};

	let updateListener: UpdateListener | null = null;
	const setUpdateListener: SetUpdateListener = (listener) => {
		updateListener = listener;
	};

	const register: Register = (entry) => {
		droppableMap.set(entry.droppableId, entry);

		updateListener?.(entry);

		return () => {
			droppableMap.delete(entry.droppableId);
		};
	};

	return { getEntry, register, setUpdateListener };
}

export function useDroppableRegistry(): DroppableRegistry {
	const [droppableRegistry] = useState(createDroppableRegistry);
	return droppableRegistry;
}
