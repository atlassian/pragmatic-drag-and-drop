import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import invariant from 'tiny-invariant';

import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import Board from './board';
import { BoardContext, type BoardContextProps } from './board-context';
import { Column } from './column';
import { type CardData, type ColumnMap, type ColumnType, getInitialData } from './data';

type Operation =
  | {
      type: 'column-reorder';
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: 'card-reorder';
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }
  | {
      type: 'card-move';
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn: number;
    };

type BoardState = {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  lastOperation: Operation | null;
};

/**
 * Registering cards and their action menu trigger element,
 * so that we can restore focus to the trigger when a card moves between columns.
 */
function createRegistry() {
  const registry = {
    cards: new Map<string, { actionMenuTrigger: HTMLElement }>(),
    selectedCards: [] as string[],
  };

  function registerCard({
    cardId,
    actionMenuTrigger,
    isSelected,
  }: {
    cardId: string;
    actionMenuTrigger: HTMLElement;
    isSelected: boolean;
  }) {
    registry.cards.set(cardId, { actionMenuTrigger });
    if (isSelected) {
      registry.selectedCards.push(cardId);
    }
    return () => {
      registry.cards.delete(cardId);
      registry.selectedCards = registry.selectedCards.filter(
        id => id !== cardId,
      );
    };
  }

  return { registry, registerCard };
}

export function BoardPrototype() {
  const [data, setData] = useState<BoardState>(getInitialData);

  const stableData = useRef(data);
  useEffect(() => {
    stableData.current = data;
  }, [data]);

  const [{ registry, registerCard }] = useState(createRegistry);

  const { lastOperation } = data;
  useEffect(() => {
    if (lastOperation === null) {
      return;
    }

    if (lastOperation.type === 'column-reorder') {
      const { startIndex, finishIndex } = lastOperation;

      const { columnMap, orderedColumnIds } = stableData.current;
      const sourceColumn = columnMap[orderedColumnIds[finishIndex]];

      liveRegion.announce(
        `You've moved ${sourceColumn.title} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${orderedColumnIds.length}.`,
      );

      return;
    }

    if (lastOperation.type === 'card-reorder') {
      const { columnId, startIndex, finishIndex } = lastOperation;

      const { columnMap } = stableData.current;
      const column = columnMap[columnId];
      const item = column.items[startIndex];

      liveRegion.announce(
        `You've moved ${item.summary} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${column.items.length} in the ${
          column.title
        } column.`,
      );

      return;
    }

    if (lastOperation.type === 'card-move') {
      const {
        finishColumnId,
        itemIndexInStartColumn,
        itemIndexInFinishColumn,
      } = lastOperation;

      const data = stableData.current;
      const destinationColumn = data.columnMap[finishColumnId];
      const item = destinationColumn.items[itemIndexInFinishColumn];

      const finishPosition =
        typeof itemIndexInFinishColumn === 'number'
          ? itemIndexInFinishColumn + 1
          : destinationColumn.items.length;

      liveRegion.announce(
        `You've moved ${item.summary} from position ${
          itemIndexInStartColumn + 1
        } to position ${finishPosition} in the ${
          destinationColumn.title
        } column.`,
      );

      const cardEntry = registry.cards.get(item.key);
      invariant(cardEntry);
      /**
       * Because the card has moved column, it will have remounted.
       * This means we need to manually restore focus to it.
       */
      cardEntry.actionMenuTrigger.focus();

      return;
    }
  }, [lastOperation, registry]);

  useEffect(() => {
    return liveRegion.cleanup();
  }, []);

  const getColumns = useCallback(() => {
    const { columnMap, orderedColumnIds } = stableData.current;
    return orderedColumnIds.map(columnId => columnMap[columnId]);
  }, []);

  const reorderColumn = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      setData(data => {
        return {
          ...data,
          orderedColumnIds: reorder({
            list: data.orderedColumnIds,
            startIndex,
            finishIndex,
          }),
          lastOperation: {
            type: 'column-reorder',
            columnId: data.orderedColumnIds[startIndex],
            startIndex,
            finishIndex,
          },
        };
      });
    },
    [],
  );

  const reorderCard = useCallback(
    ({
      columnId,
      startIndex,
      finishIndex,
    }: {
      columnId: string;
      startIndex: number;
      finishIndex: number;
    }) => {
      setData(data => {
        const sourceColumn = data.columnMap[columnId];
        const updatedItems = reorder({
          list: sourceColumn.items,
          startIndex,
          finishIndex,
        });

        const updatedSourceColumn: ColumnType = {
          ...sourceColumn,
          items: updatedItems,
        };

        const updatedMap: ColumnMap = {
          ...data.columnMap,
          [columnId]: updatedSourceColumn,
        };

        return {
          ...data,
          columnMap: updatedMap,
          lastOperation: {
            type: 'card-reorder',
            columnId,
            startIndex,
            finishIndex,
          },
        };
      });
    },
    [],
  );

  const moveCard = useCallback(
    ({
      startColumnId,
      finishColumnId,
      itemIndexInStartColumn,
      itemIndexInFinishColumn,
    }: {
      startColumnId: string;
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn?: number;
    }) => {
      setData(data => {
        const sourceColumn = data.columnMap[startColumnId];
        const destinationColumn = data.columnMap[finishColumnId];
        const item: CardData = sourceColumn.items[itemIndexInStartColumn];

        const otherSelectedItems = sourceColumn.items.filter(
          ({ key }) => key !== item.key && registry.selectedCards.includes(key),
        );

        let destinationItems = Array.from(destinationColumn.items);
        if (typeof itemIndexInFinishColumn === 'number') {
          destinationItems.splice(
            itemIndexInFinishColumn,
            0,
            item,
            ...otherSelectedItems,
          );
        } else {
          destinationItems.push(item, ...otherSelectedItems);
        }

        const updatedMap = {
          ...data.columnMap,
          [startColumnId]: {
            ...sourceColumn,
            items: sourceColumn.items.filter(
              i =>
                i.key !== item.key && !registry.selectedCards.includes(i.key),
            ),
          },
          [finishColumnId]: {
            ...destinationColumn,
            items: destinationItems,
          },
        };

        return {
          ...data,
          columnMap: updatedMap,
          lastOperation: {
            type: 'card-move',
            startColumnId,
            finishColumnId,
            itemIndexInStartColumn,
            itemIndexInFinishColumn:
              typeof itemIndexInFinishColumn === 'number'
                ? itemIndexInFinishColumn
                : destinationItems.length - 1,
          },
        };
      });
    },
    [registry.selectedCards],
  );

  useEffect(() => {
    return combine(
      monitorForElements({
        onDrop(args) {
          const { location, source } = args;
          // didn't drop on anything
          if (!location.current.dropTargets.length) {
            return;
          }
          // need to handle drop

          // 1. remove element from original position
          // 2. move to new position

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

            const finishIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: 'horizontal',
            });

            reorderColumn({ startIndex, finishIndex });
          }
          // Dragging a card
          if (source.data.type === 'card') {
            const itemId = source.data.itemId;
            invariant(typeof itemId === 'string');
            // TODO: these lines not needed if item has columnId on it
            const [, startColumnRecord] = location.initial.dropTargets;
            const sourceId = startColumnRecord.data.columnId;
            invariant(typeof sourceId === 'string');
            const sourceColumn = data.columnMap[sourceId];
            const itemIndex = sourceColumn.items.findIndex(
              item => item.key === itemId,
            );

            if (location.current.dropTargets.length === 1) {
              const [destinationColumnRecord] = location.current.dropTargets;
              const destinationId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationId === 'string');
              const destinationColumn = data.columnMap[destinationId];
              invariant(destinationColumn);

              // reordering in same column
              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget: sourceColumn.items.length - 1,
                  closestEdgeOfTarget: null,
                  axis: 'vertical',
                });
                reorderCard({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                });
                return;
              }

              // moving to a new column
              moveCard({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
              });
              return;
            }

            // dropping in a column (relative to a card)
            if (location.current.dropTargets.length === 2) {
              const [destinationCardRecord, destinationColumnRecord] =
                location.current.dropTargets;
              const destinationColumnId = destinationColumnRecord.data.columnId;
              invariant(typeof destinationColumnId === 'string');
              const destinationColumn = data.columnMap[destinationColumnId];

              const indexOfTarget = destinationColumn.items.findIndex(
                item => item.key === destinationCardRecord.data.itemId,
              );
              const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                destinationCardRecord.data,
              );

              // case 1: ordering in the same column
              if (sourceColumn === destinationColumn) {
                const destinationIndex = getReorderDestinationIndex({
                  startIndex: itemIndex,
                  indexOfTarget,
                  closestEdgeOfTarget,
                  axis: 'vertical',
                });
                reorderCard({
                  columnId: sourceColumn.columnId,
                  startIndex: itemIndex,
                  finishIndex: destinationIndex,
                });
                return;
              }

              // case 2: moving into a new column relative to a card

              const destinationIndex =
                closestEdgeOfTarget === 'bottom'
                  ? indexOfTarget + 1
                  : indexOfTarget;

              moveCard({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                itemIndexInFinishColumn: destinationIndex,
              });
            }
          }
        },
      }),
    );
  }, [data, moveCard, reorderCard, reorderColumn]);

  const getSelectedCards = useCallback(() => {
    return registry.selectedCards;
  }, [registry]);

  const contextValue: BoardContextProps = useMemo(() => {
    return {
      getColumns,
      reorderColumn,
      reorderCard,
      moveCard,
      registerCard,
      getSelectedCards,
    };
  }, [
    getColumns,
    reorderColumn,
    reorderCard,
    moveCard,
    registerCard,
    getSelectedCards,
  ]);

  return (
    <BoardContext.Provider value={contextValue}>
      <Board>
        {data.orderedColumnIds.map(columnId => {
          console.log('columnId ->', data.columnMap[columnId], data);
          return <Column column={data.columnMap[columnId]} key={columnId} />;
        })}
      </Board>
    </BoardContext.Provider>
  );
}
