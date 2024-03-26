import React from 'react';

import { render } from '@testing-library/react';
import type { DroppableStateSnapshot } from 'react-beautiful-dnd';

import { DragDropContext, Droppable } from '../../../src';

function App({ spy }: { spy?: jest.Mock }) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => {
          spy?.(provided, snapshot);
          return <div ref={provided.innerRef} {...provided.droppableProps} />;
        }}
      </Droppable>
    </DragDropContext>
  );
}

export function getSnapshots(spy: jest.Mock): DroppableStateSnapshot[] {
  return spy.mock.calls.map(call => {
    const snapshot: DroppableStateSnapshot = call[1];
    return snapshot;
  });
}

it('should have a resting snapshot', () => {
  const spy = jest.fn();
  render(<App spy={spy} />);

  const snapshots = getSnapshots(spy);

  expect(snapshots).toHaveLength(1);
  expect(snapshots[0]).toEqual({
    draggingFromThisWith: null,
    draggingOverWith: null,
    isDraggingOver: false,
    isUsingPlaceholder: false,
  });
});
