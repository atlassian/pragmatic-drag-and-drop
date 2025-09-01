import type { DropResult } from 'react-beautiful-dnd';

import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

export type Item = {
	itemId: string;
};

export type ColumnType = {
	title: string;
	columnId: string;
	items: Item[];
};
export type ColumnMap = { [columnId: string]: ColumnType };

function getItems({ count, startColumnId }: { count: number; startColumnId: string }): Item[] {
	return Array.from(
		{ length: count },
		(_, index): Item => ({
			itemId: `${startColumnId}${index}`,
		}),
	);
}

export type Data = {
	columnMap: ColumnMap;
	orderedColumnIds: string[];
};

export function getInitialData(): Data {
	const orderedColumnIds: string[] = ['A', 'B', 'C'];
	const columns: ColumnType[] = orderedColumnIds.map((columnId, index) => {
		const column: ColumnType = {
			title: `Column ${columnId}`,
			columnId: columnId,
			items: getItems({
				startColumnId: columnId,
				count: Math.max(10 - 2 * index, 0),
			}),
		};
		return column;
	});
	const columnMap = columns.reduce((acc: ColumnMap, column) => {
		acc[column.columnId] = column;
		return acc;
	}, {});

	return { columnMap, orderedColumnIds };
}

export function reorderColumn(data: Data, { source, destination }: DropResult): Data {
	if (!destination) {
		return data;
	}

	const startIndex = source.index;
	const finishIndex = destination.index;

	return {
		...data,
		orderedColumnIds: reorder({
			list: data.orderedColumnIds,
			startIndex,
			finishIndex,
		}),
	};
}

/**
 * Reorders a card within the same list.
 */
export function reorderCard(data: Data, { source, destination }: DropResult): Data {
	if (!destination) {
		return data;
	}

	const column = data.columnMap[source.droppableId];

	const updatedItems = reorder({
		list: column.items,
		startIndex: source.index,
		finishIndex: destination.index,
	});

	const updatedMap = {
		...data.columnMap,
		[source.droppableId]: {
			...column,
			items: updatedItems,
		},
	};

	return { ...data, columnMap: updatedMap };
}

/**
 * Moves a card to a different list.
 */
export function moveCard(data: Data, { source, destination, draggableId }: DropResult): Data {
	if (!destination) {
		return data;
	}

	const sourceColumn = data.columnMap[source.droppableId];
	const destinationColumn = data.columnMap[destination.droppableId];

	const item = sourceColumn.items.find(({ itemId }) => itemId === draggableId);

	if (item === undefined) {
		return data;
	}

	const updatedMap = {
		...data.columnMap,
		[sourceColumn.columnId]: {
			...sourceColumn,
			items: sourceColumn.items.filter((i) => i !== item),
		},
		[destinationColumn.columnId]: {
			...destinationColumn,
			items: [
				...destinationColumn.items.slice(0, destination.index),
				item,
				...destinationColumn.items.slice(destination.index),
			],
		},
	};

	return { ...data, columnMap: updatedMap };
}

/**
 * Clears the items in a column.
 */
export function clearColumn(data: Data, columnId: string): Data {
	const updatedMap = {
		...data.columnMap,
		[columnId]: {
			...data.columnMap[columnId],
			items: [],
		},
	};

	return { ...data, columnMap: updatedMap };
}
