import React, { useEffect, useState } from 'react';

import invariant from 'tiny-invariant';

import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { type ColumnMap, type ColumnType, getBasicData, type Person } from './data/people';
import Board from './pieces/board-with-multi-drag/board';
import { Column } from './pieces/board-with-multi-drag/column';

const getHomeColumn = ({
  columnMap,
  orderedColumnIds,
  userId,
}: {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  userId: string;
}) => {
  const columnId = orderedColumnIds.find(id =>
    columnMap[id].items.some(item => item.userId === userId),
  );
  invariant(columnId, 'Count not find column for user');
  return columnMap[columnId];
};

const multiSelect = ({
  columnMap,
  orderedColumnIds,
  selectedUserIds,
  userId,
}: {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  selectedUserIds: string[];
  userId: string;
}) => {
  const columnOfNew = getHomeColumn({
    columnMap,
    orderedColumnIds,
    userId,
  });
  const indexOfNew = columnOfNew.items.findIndex(
    item => item.userId === userId,
  );

  // if no items selected, select everything in the column up to the index of the current item
  if (!selectedUserIds.length) {
    return columnOfNew.items.slice(0, indexOfNew + 1).map(item => item.userId);
  }

  const lastSelected = selectedUserIds[selectedUserIds.length - 1];
  const columnOfLast = getHomeColumn({
    columnMap,
    orderedColumnIds,
    userId: lastSelected,
  });
  const indexOfLast = columnOfLast.items.findIndex(
    item => item.userId === lastSelected,
  );

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.items.slice(0, indexOfNew + 1).map(item => item.userId);
  }

  // multi selecting in the same column
  // need to select everything between the last index and the current index inclusive

  // nothing to do here
  if (indexOfNew === indexOfLast) {
    return;
  }

  const isSelectingForwards = indexOfNew > indexOfLast;
  const start = isSelectingForwards ? indexOfLast : indexOfNew;
  const end = isSelectingForwards ? indexOfNew : indexOfLast;
  const inBetween = columnOfNew.items
    .slice(start, end + 1)
    .map(item => item.userId);

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will always be selected
  const toAdd = inBetween.filter(userId => !selectedUserIds.includes(userId));
  const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();

  return [...selectedUserIds, ...sorted];
};

const withNewItems = (column: ColumnType, items: Person[]): ColumnType => ({
  columnId: column.columnId,
  title: column.title,
  items,
});

type SortUserIdsArgs = {
  draggedItemId: string;
  data: { columnMap: ColumnMap; orderedColumnIds: string[] };
  selectedUserIds: string[];
};

const sortUserIds = ({
  draggedItemId,
  data,
  selectedUserIds,
}: SortUserIdsArgs): string[] => {
  return [...selectedUserIds].sort((a: string, b: string) => {
    // moving the dragged item to the top of the list
    if (a === draggedItemId) {
      return -1;
    }
    if (b === draggedItemId) {
      return 1;
    }

    const columnA = data.orderedColumnIds.find(columnId =>
      data.columnMap[columnId].items.some(i => i.userId === a),
    );
    const columnB = data.orderedColumnIds.find(columnId =>
      data.columnMap[columnId].items.some(i => i.userId === b),
    );
    const aIndex = data.columnMap[columnA!].items.findIndex(
      i => i.userId === a,
    );
    const bIndex = data.columnMap[columnB!].items.findIndex(
      i => i.userId === b,
    );
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    // sorting by their order in the selectedUserIds list
    return -1;
  });
};

type MultiDragReorderArgs = {
  data: { columnMap: ColumnMap; orderedColumnIds: string[] };
  selectedUserIds: string[];
  draggedItemId: string;
  destinationColumnId: string;
  finalIndex: number;
};

const multiDragReorder = ({
  data,
  selectedUserIds,
  draggedItemId,
  destinationColumnId,
  finalIndex,
}: MultiDragReorderArgs) => {
  // 1. Remove all selected items from their columns
  const withRemovedItems = data.orderedColumnIds.reduce((acc, columnId) => {
    const column = data.columnMap[columnId];
    const items = column.items.filter(
      item => !selectedUserIds.includes(item.userId),
    );
    return {
      ...acc,
      [columnId]: withNewItems(column, items),
    };
  }, {} as ColumnMap);

  // 2. Calculate the new order of items (sort selectedUserIds by their index in their own column)
  const orderedSelectedUserIds = sortUserIds({
    data,
    draggedItemId,
    selectedUserIds,
  });

  const orderedSelectedItems = orderedSelectedUserIds.map(
    id =>
      getHomeColumn({
        columnMap: data.columnMap,
        orderedColumnIds: data.orderedColumnIds,
        userId: id,
      }).items.find(i => i.userId === id)!,
  );

  // 3. Insert them back in at the correct index
  const final: ColumnType = withRemovedItems[destinationColumnId];
  const withInserted = (() => {
    const base = [...final.items];
    base.splice(finalIndex, 0, ...orderedSelectedItems);
    return base;
  })();

  const withAddedTasks = {
    ...withRemovedItems,
    [destinationColumnId]: withNewItems(final, withInserted),
  };

  return {
    reorderedColumnMap: withAddedTasks,
    orderedSelectedUserIds,
  };
};

export default function BoardExample() {
  const [data, setData] = useState<{
    columnMap: ColumnMap;
    orderedColumnIds: string[];
  }>(() => getBasicData());
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  useEffect(() => {
    return monitorForElements({
      onGenerateDragPreview({ source }) {
        if (source.data.type === 'card') {
          const itemId = source.data.itemId;
          invariant(typeof itemId === 'string');
          if (!selectedUserIds.includes(itemId)) {
            setSelectedUserIds([]);
          }
        }
      },
      onDragStart({ source }) {
        if (source.data.type === 'card') {
          setIsDraggingCard(true);
        }
      },
      onDrop(args) {
        const { location, source } = args;

        if (source.data.type === 'card') {
          setIsDraggingCard(false);
        }

        // didn't drop on anything
        if (!location.current.dropTargets.length) {
          return;
        }

        // dragging a column
        if (source.data.type === 'column') {
          const startIndex: number = data.orderedColumnIds.findIndex(
            columnId => columnId === source.data.columnId,
          );

          const target = location.current.dropTargets[0];
          const indexOfTarget: number = data.orderedColumnIds.findIndex(
            id => id === target.data.columnId,
          );
          const closestEdgeOfTarget: Edge | null = extractClosestEdge(
            target.data,
          );

          const updated = reorderWithEdge({
            list: data.orderedColumnIds,
            startIndex,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: 'horizontal',
          });

          console.log('reordering column', {
            startIndex,
            destinationIndex: updated.findIndex(
              columnId => columnId === target.data.columnId,
            ),
            closestEdgeOfTarget,
          });

          setData({ ...data, orderedColumnIds: updated });
        }

        // dragging a card
        if (source.data.type === 'card') {
          const itemId = source.data.itemId;
          invariant(typeof itemId === 'string');
          const [, startColumnRecord] = location.initial.dropTargets;
          const sourceId = startColumnRecord.data.columnId;
          invariant(typeof sourceId === 'string');
          const sourceColumn = data.columnMap[sourceId];
          const itemIndex = sourceColumn.items.findIndex(
            item => item.userId === itemId,
          );
          const item: Person = sourceColumn.items[itemIndex];

          // Multi drag
          if (selectedUserIds.length > 1) {
            // Dropping in a column (relative to a card)
            if (location.current.dropTargets.length === 2) {
              // 1. Get target index
              const [destinationCardRecord, destinationColumnRecord] =
                location.current.dropTargets;
              const destinationColumnId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationColumnId === 'string');
              const destinationColumn = data.columnMap[destinationColumnId];

              const indexOfTarget = destinationColumn.items.findIndex(
                item => item.userId === destinationCardRecord.data.itemId,
              );

              const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                destinationCardRecord.data,
              );

              const indexOfTargetWithEdge = (() => {
                if (sourceId === destinationColumnId) {
                  return getReorderDestinationIndex({
                    closestEdgeOfTarget,
                    startIndex: itemIndex,
                    indexOfTarget: indexOfTarget,
                    axis: 'vertical',
                  });
                }
                return closestEdgeOfTarget === 'bottom'
                  ? indexOfTarget + 1
                  : indexOfTarget;
              })();

              const selectedItemsBeforeTarget = selectedUserIds.filter(id => {
                const itemIndex = destinationColumn.items.findIndex(
                  i => i.userId === id,
                );
                if (itemIndex === -1) {
                  return false;
                }
                return itemIndex < indexOfTargetWithEdge;
              });

              const finalIndex = selectedItemsBeforeTarget.length
                ? indexOfTargetWithEdge - (selectedItemsBeforeTarget.length - 1)
                : indexOfTargetWithEdge;

              // 2. Perform reorder
              const { reorderedColumnMap, orderedSelectedUserIds } =
                multiDragReorder({
                  data,
                  selectedUserIds,
                  draggedItemId: itemId,
                  destinationColumnId,
                  finalIndex,
                });

              setData({
                ...data,
                columnMap: reorderedColumnMap,
              });
              setSelectedUserIds(orderedSelectedUserIds);
              return;
            }

            // Dropping on a column (inserting into last position)
            if (location.current.dropTargets.length === 1) {
              // 1. Get target index
              const [destinationColumnRecord] = location.current.dropTargets;
              const destinationColumnId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationColumnId === 'string');
              const destinationColumn = data.columnMap[destinationColumnId];
              invariant(destinationColumn);
              const finalIndex = destinationColumn.items.length;

              // 2: Perform reorder
              const { reorderedColumnMap, orderedSelectedUserIds } =
                multiDragReorder({
                  data,
                  selectedUserIds,
                  draggedItemId: itemId,
                  destinationColumnId,
                  finalIndex,
                });

              setData({
                ...data,
                columnMap: reorderedColumnMap,
              });
              setSelectedUserIds(orderedSelectedUserIds);
              return;
            }
          }

          // Single drag: dropping on a column (inserting into last position)
          if (location.current.dropTargets.length === 1) {
            const [destinationColumnRecord] = location.current.dropTargets;
            const destinationId = destinationColumnRecord.data.columnId;
            invariant(typeof destinationId === 'string');
            const destinationColumn = data.columnMap[destinationId];
            invariant(destinationColumn);

            // Reordering in same column
            if (sourceColumn === destinationColumn) {
              const updated = reorderWithEdge({
                list: sourceColumn.items,
                startIndex: itemIndex,
                indexOfTarget: sourceColumn.items.length - 1,
                closestEdgeOfTarget: null,
                axis: 'vertical',
              });
              const updatedMap = {
                ...data.columnMap,
                [sourceColumn.columnId]: {
                  ...sourceColumn,
                  items: updated,
                },
              };
              setData({ ...data, columnMap: updatedMap });
              console.log('moving card to end position in same column', {
                startIndex: itemIndex,
                destinationIndex: updated.findIndex(i => i.userId === itemId),
                edge: null,
              });
              return;
            }

            // Moving to a new column
            const updatedMap = {
              ...data.columnMap,
              [sourceColumn.columnId]: {
                ...sourceColumn,
                items: sourceColumn.items.filter(i => i.userId !== itemId),
              },
              [destinationColumn.columnId]: {
                ...destinationColumn,
                items: [...destinationColumn.items, item],
              },
            };

            setData({ ...data, columnMap: updatedMap });
            console.log('moving card to end position of another column', {
              startIndex: itemIndex,
              destinationIndex: updatedMap[
                destinationColumn.columnId
              ].items.findIndex(i => i.userId === itemId),
              edge: null,
            });
            return;
          }

          // Single drag: dropping in a column (relative to a card)
          if (location.current.dropTargets.length === 2) {
            const [destinationCardRecord, destinationColumnRecord] =
              location.current.dropTargets;
            const destinationColumnId = destinationColumnRecord.data.columnId;
            invariant(typeof destinationColumnId === 'string');
            const destinationColumn = data.columnMap[destinationColumnId];

            const indexOfTarget = destinationColumn.items.findIndex(
              item => item.userId === destinationCardRecord.data.itemId,
            );
            const closestEdgeOfTarget: Edge | null = extractClosestEdge(
              destinationCardRecord.data,
            );

            // Case 1: ordering in the same column
            if (sourceColumn === destinationColumn) {
              const updated = reorderWithEdge({
                list: sourceColumn.items,
                startIndex: itemIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
              });
              const updatedSourceColumn: ColumnType = {
                ...sourceColumn,
                items: updated,
              };
              const updatedMap: ColumnMap = {
                ...data.columnMap,
                [sourceColumn.columnId]: updatedSourceColumn,
              };
              console.log('dropping relative to card in the same column', {
                startIndex: itemIndex,
                destinationIndex: updated.findIndex(i => i.userId === itemId),
                closestEdgeOfTarget,
              });
              setData({ ...data, columnMap: updatedMap });
              return;
            }

            // Case 2: moving into a new column relative to a card
            const updatedSourceColumn: ColumnType = {
              ...sourceColumn,
              items: sourceColumn.items.filter(i => i !== item),
            };
            const updated: Person[] = Array.from(destinationColumn.items);
            const destinationIndex =
              closestEdgeOfTarget === 'bottom'
                ? indexOfTarget + 1
                : indexOfTarget;
            updated.splice(destinationIndex, 0, item);

            const updatedDestinationColumn: ColumnType = {
              ...destinationColumn,
              items: updated,
            };
            const updatedMap: ColumnMap = {
              ...data.columnMap,
              [sourceColumn.columnId]: updatedSourceColumn,
              [destinationColumn.columnId]: updatedDestinationColumn,
            };
            console.log('dropping on a card in different column', {
              sourceColumn: sourceColumn.columnId,
              destinationColumn: destinationColumn.columnId,
              startIndex: itemIndex,
              destinationIndex,
              closestEdgeOfTarget,
            });
            setData({ ...data, columnMap: updatedMap });
          }
        }
      },
    });
  }, [data, selectedUserIds]);

  const toggleSelection = (userId: string) => {
    const updatedUserIds = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!selectedUserIds.includes(userId)) {
        return [userId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedUserIds.length > 1) {
        return [userId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    setSelectedUserIds(updatedUserIds);
  };

  const toggleSelectionInGroup = (userId: string) => {
    const index = selectedUserIds.indexOf(userId);

    // if not selected - add it to the selected items
    if (index === -1) {
      setSelectedUserIds([...selectedUserIds, userId]);
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const newIds = [...selectedUserIds];
    newIds.splice(index, 1);
    setSelectedUserIds(newIds);
  };

  // This behaviour matches the MacOSX finder selection
  const multiSelectTo = (userId: string) => {
    const updated = multiSelect({
      columnMap: data.columnMap,
      orderedColumnIds: data.orderedColumnIds,
      selectedUserIds,
      userId,
    });

    if (!updated) {
      return;
    }

    setSelectedUserIds(updated);
  };

  return (
    <Board>
      {data.orderedColumnIds.map(columnId => {
        return (
          <Column
            column={data.columnMap[columnId]}
            key={columnId}
            isDraggingCard={isDraggingCard}
            selectedUserIds={selectedUserIds}
            multiSelectTo={multiSelectTo}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
          />
        );
      })}
    </Board>
  );
}
