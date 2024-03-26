import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import invariant from 'tiny-invariant';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { ColumnMap, ColumnType, getBasicData, Person } from './data/people';
import Board from './pieces/board/board';
import { BoardContext, BoardContextValue } from './pieces/board/board-context';
import { Column } from './pieces/board/column';
import { createRegistry } from './pieces/board/registry';

type Outcome =
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

type Trigger = 'pointer' | 'keyboard';

type Operation = {
  trigger: Trigger;
  outcome: Outcome;
};

type BoardState = {
  columnMap: ColumnMap;
  orderedColumnIds: string[];
  lastOperation: Operation | null;
};

export default function BoardExample() {
  const [data, setData] = useState<BoardState>(() => {
    const base = getBasicData();
    return {
      ...base,
      lastOperation: null,
    };
  });

  const stableData = useRef(data);
  useEffect(() => {
    stableData.current = data;
  }, [data]);

  const [registry] = useState(createRegistry);

  const { lastOperation } = data;

  useEffect(() => {
    if (lastOperation === null) {
      return;
    }
    const { outcome, trigger } = lastOperation;

    if (outcome.type === 'column-reorder') {
      const { startIndex, finishIndex } = outcome;

      const { columnMap, orderedColumnIds } = stableData.current;
      const sourceColumn = columnMap[orderedColumnIds[finishIndex]];

      const entry = registry.getColumn(sourceColumn.columnId);
      triggerPostMoveFlash(entry.element);

      liveRegion.announce(
        `You've moved ${sourceColumn.title} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${orderedColumnIds.length}.`,
      );

      return;
    }

    if (outcome.type === 'card-reorder') {
      const { columnId, startIndex, finishIndex } = outcome;

      const { columnMap } = stableData.current;
      const column = columnMap[columnId];
      const item = column.items[finishIndex];

      const entry = registry.getCard(item.userId);
      triggerPostMoveFlash(entry.element);

      if (trigger !== 'keyboard') {
        return;
      }

      liveRegion.announce(
        `You've moved ${item.name} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${column.items.length} in the ${
          column.title
        } column.`,
      );

      return;
    }

    if (outcome.type === 'card-move') {
      const {
        finishColumnId,
        itemIndexInStartColumn,
        itemIndexInFinishColumn,
      } = outcome;

      const data = stableData.current;
      const destinationColumn = data.columnMap[finishColumnId];
      const item = destinationColumn.items[itemIndexInFinishColumn];

      const finishPosition =
        typeof itemIndexInFinishColumn === 'number'
          ? itemIndexInFinishColumn + 1
          : destinationColumn.items.length;

      const entry = registry.getCard(item.userId);
      triggerPostMoveFlash(entry.element);

      if (trigger !== 'keyboard') {
        return;
      }

      liveRegion.announce(
        `You've moved ${item.name} from position ${
          itemIndexInStartColumn + 1
        } to position ${finishPosition} in the ${
          destinationColumn.title
        } column.`,
      );

      /**
       * Because the card has moved column, it will have remounted.
       * This means we need to manually restore focus to it.
       */
      entry.actionMenuTrigger.focus();

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
      trigger = 'keyboard',
    }: {
      startIndex: number;
      finishIndex: number;
      trigger?: Trigger;
    }) => {
      setData(data => {
        const outcome: Outcome = {
          type: 'column-reorder',
          columnId: data.orderedColumnIds[startIndex],
          startIndex,
          finishIndex,
        };

        return {
          ...data,
          orderedColumnIds: reorder({
            list: data.orderedColumnIds,
            startIndex,
            finishIndex,
          }),
          lastOperation: {
            outcome,
            trigger: trigger,
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
      trigger = 'keyboard',
    }: {
      columnId: string;
      startIndex: number;
      finishIndex: number;
      trigger?: Trigger;
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

        const outcome: Outcome | null = {
          type: 'card-reorder',
          columnId,
          startIndex,
          finishIndex,
        };

        return {
          ...data,
          columnMap: updatedMap,
          lastOperation: {
            trigger: trigger,
            outcome,
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
      trigger = 'keyboard',
    }: {
      startColumnId: string;
      finishColumnId: string;
      itemIndexInStartColumn: number;
      itemIndexInFinishColumn?: number;
      trigger?: 'pointer' | 'keyboard';
    }) => {
      // invalid cross column movement
      if (startColumnId === finishColumnId) {
        return;
      }
      setData(data => {
        const sourceColumn = data.columnMap[startColumnId];
        const destinationColumn = data.columnMap[finishColumnId];
        const item: Person = sourceColumn.items[itemIndexInStartColumn];

        const destinationItems = Array.from(destinationColumn.items);
        // Going into the first position if no index is provided
        const newIndexInDestination = itemIndexInFinishColumn ?? 0;
        destinationItems.splice(newIndexInDestination, 0, item);

        const updatedMap = {
          ...data.columnMap,
          [startColumnId]: {
            ...sourceColumn,
            items: sourceColumn.items.filter(i => i.userId !== item.userId),
          },
          [finishColumnId]: {
            ...destinationColumn,
            items: destinationItems,
          },
        };

        const outcome: Outcome | null = {
          type: 'card-move',
          finishColumnId,
          itemIndexInStartColumn,
          itemIndexInFinishColumn: newIndexInDestination,
        };

        return {
          ...data,
          columnMap: updatedMap,
          lastOperation: {
            outcome,
            trigger: trigger,
          },
        };
      });
    },
    [],
  );

  const [instanceId] = useState(() => Symbol('instance-id'));

  useEffect(() => {
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          return source.data.instanceId === instanceId;
        },
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

            reorderColumn({ startIndex, finishIndex, trigger: 'pointer' });
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
              item => item.userId === itemId,
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
                  trigger: 'pointer',
                });
                return;
              }

              // moving to a new column
              moveCard({
                itemIndexInStartColumn: itemIndex,
                startColumnId: sourceColumn.columnId,
                finishColumnId: destinationColumn.columnId,
                trigger: 'pointer',
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
                item => item.userId === destinationCardRecord.data.itemId,
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
                  trigger: 'pointer',
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
                trigger: 'pointer',
              });
            }
          }
        },
      }),
    );
  }, [data, instanceId, moveCard, reorderCard, reorderColumn]);

  const contextValue: BoardContextValue = useMemo(() => {
    return {
      getColumns,
      reorderColumn,
      reorderCard,
      moveCard,
      registerCard: registry.registerCard,
      registerColumn: registry.registerColumn,
      instanceId,
    };
  }, [getColumns, reorderColumn, reorderCard, registry, moveCard, instanceId]);

  return (
    <BoardContext.Provider value={contextValue}>
      <Board>
        {data.orderedColumnIds.map(columnId => {
          return <Column column={data.columnMap[columnId]} key={columnId} />;
        })}
      </Board>
    </BoardContext.Provider>
  );
}
