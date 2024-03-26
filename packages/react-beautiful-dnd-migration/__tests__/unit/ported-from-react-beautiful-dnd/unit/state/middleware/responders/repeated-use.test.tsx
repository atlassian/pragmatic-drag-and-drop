// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/state/middleware/responders/repeated-use.spec.js>

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type {
  DragDropContextProps,
  DragStart,
  DragUpdate,
  DropResult,
} from 'react-beautiful-dnd';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../../integration/_utils/controls';

jest.useFakeTimers();

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

function App(props: Partial<DragDropContextProps>) {
  return (
    <DragDropContext onDragEnd={() => {}} {...props}>
      <Droppable droppableId="droppable">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Draggable draggableId="draggable-0" index={0}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  data-is-dragging={snapshot.isDragging}
                >
                  first
                </div>
              )}
            </Draggable>
            <Draggable draggableId="draggable-1" index={1}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  second
                </div>
              )}
            </Draggable>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const expectedDragStart: DragStart = {
  mode: 'FLUID',
  type: 'DEFAULT',
  draggableId: 'draggable-0',
  source: {
    droppableId: 'droppable',
    index: 0,
  },
};

it('should behave correctly across multiple drags', () => {
  const onDragStart = jest.fn();
  const onDragUpdate = jest.fn();
  const onDragEnd = jest.fn();

  const { getByText } = render(
    <App
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    />,
  );

  for (let i = 0; i < 4; i++) {
    const draggable = getByText('first');

    // Start the drag
    setElementFromPoint(draggable);
    mouse.lift(draggable);
    jest.runOnlyPendingTimers();
    expect(onDragStart).toHaveBeenCalledWith(
      expectedDragStart,
      expect.any(Object),
    );

    // Update the drag
    extractClosestEdge.mockReturnValue('bottom');
    fireEvent.dragOver(getByText('second'));
    jest.runOnlyPendingTimers();
    const expectedDragUpdate: DragUpdate = {
      ...expectedDragStart,
      destination: {
        droppableId: 'droppable',
        index: 1,
      },
      combine: null,
    };
    expect(onDragUpdate).toHaveBeenCalledWith(
      expectedDragUpdate,
      expect.any(Object),
    );
    expect(onDragUpdate).toHaveBeenCalledTimes(1);

    // Drop
    const expectedDropResult: DropResult = {
      ...expectedDragUpdate,
      reason: 'DROP',
    };
    mouse.drop(draggable);
    expect(onDragEnd).toHaveBeenCalledWith(
      expectedDropResult,
      expect.any(Object),
    );
    expect(onDragEnd).toHaveBeenCalledTimes(1);

    onDragStart.mockReset();
    onDragUpdate.mockReset();
    onDragEnd.mockReset();
  }
});
