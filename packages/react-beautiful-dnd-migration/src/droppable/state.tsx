// eslint-disable-next-line import/no-extraneous-dependencies
import type { DragStart, DragUpdate, DroppableId } from 'react-beautiful-dnd';

import type { Action } from '../internal-types';

type DroppableState = {
  draggingFromThisWith: string | null;
  draggingOverWith: string | null;
  isDraggingOver: boolean;
};

export type DroppableAction =
  | Action<'DRAG_START', { droppableId: DroppableId; start: DragStart }>
  | Action<'DRAG_UPDATE', { droppableId: DroppableId; update: DragUpdate }>
  | Action<'DRAG_CLEAR'>;

export const idleState: DroppableState = {
  draggingFromThisWith: null,
  draggingOverWith: null,
  isDraggingOver: false,
};

export function reducer(
  state: DroppableState,
  action: DroppableAction,
): DroppableState {
  if (action.type === 'DRAG_START') {
    const { droppableId, start } = action.payload;
    const { draggableId, source } = start;

    const isDraggingOver = source.droppableId === droppableId;
    const draggingOverWith = isDraggingOver ? draggableId : null;

    const isDraggingFrom = source.droppableId === droppableId;
    const draggingFromThisWith = isDraggingFrom ? draggableId : null;

    return {
      ...state,
      isDraggingOver,
      draggingFromThisWith,
      draggingOverWith,
    };
  }

  if (action.type === 'DRAG_UPDATE') {
    const { droppableId, update } = action.payload;
    const { destination = null, draggableId, source } = update;

    const isDraggingOver = destination?.droppableId === droppableId;
    const draggingOverWith = isDraggingOver ? draggableId : null;

    const isDraggingFrom = source.droppableId === droppableId;
    const draggingFromThisWith = isDraggingFrom ? draggableId : null;

    return {
      ...state,
      isDraggingOver,
      draggingFromThisWith,
      draggingOverWith,
    };
  }

  if (action.type === 'DRAG_CLEAR') {
    return idleState;
  }

  return state;
}
