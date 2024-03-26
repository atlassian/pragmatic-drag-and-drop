import { useState } from 'react';

import invariant from 'tiny-invariant';

import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';

type DragObserverState =
  | {
      isDragging: false;
    }
  | {
      isDragging: true;
      location: DragLocationHistory;
    };

type DragObserver = {
  getState(): DragObserverState;
  startDrag(args: { location: DragLocationHistory }): void;
  updateDrag(args: { location: DragLocationHistory }): void;
  stopDrag(args: { location: DragLocationHistory }): void;
};

function createDragObserver() {
  let state: DragObserverState = {
    isDragging: false,
  };

  const getState = () => {
    return state;
  };

  const startDrag = ({ location }: { location: DragLocationHistory }) => {
    state = {
      isDragging: true,
      location,
    };
  };

  const updateDrag = ({ location }: { location: DragLocationHistory }) => {
    invariant(state.isDragging);
    state.location = location;
  };

  const stopDrag = () => {
    state = { isDragging: false };
  };

  return { getState, startDrag, updateDrag, stopDrag };
}

export function useDragObserver(): DragObserver {
  const [dragObserver] = useState(createDragObserver);
  return dragObserver;
}
