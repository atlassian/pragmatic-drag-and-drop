// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/state/middleware/responders/flushing.spec.js>

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type { DragDropContextProps, DropResult } from 'react-beautiful-dnd';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '../../../../../../../src';
import { getPlaceholder, setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../../integration/_utils/controls';

function App(props: Partial<DragDropContextProps>) {
  return (
    <DragDropContext onDragEnd={() => {}} {...props}>
      <Droppable droppableId="droppable">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Draggable draggableId="draggable-0" index={0}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
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

jest.useFakeTimers();

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

afterEach(() => {
  mouse.cancel(document.body);
});

it('should trigger an on drag start after in the next cycle', () => {
  const onDragStart = jest.fn();

  const { getByText } = render(<App onDragStart={onDragStart} />);

  const draggable = getByText('first');

  setElementFromPoint(draggable);
  mouse.lift(draggable);

  expect(onDragStart).not.toHaveBeenCalled();

  jest.runOnlyPendingTimers();
  expect(onDragStart).toHaveBeenCalledTimes(1);
});

it('should queue a drag start if an action comes in while the timeout is pending', () => {
  const onDragStart = jest.fn();
  const onDragUpdate = jest.fn();

  const { getByText } = render(
    <App onDragStart={onDragStart} onDragUpdate={onDragUpdate} />,
  );

  const draggable = getByText('first');

  setElementFromPoint(draggable);
  mouse.lift(draggable);

  extractClosestEdge.mockReturnValue('bottom');
  fireEvent.dragOver(getByText('second'));

  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDragUpdate).not.toHaveBeenCalled();

  jest.runOnlyPendingTimers();

  expect(onDragStart).toHaveBeenCalledTimes(1);
  expect(onDragUpdate).toHaveBeenCalledTimes(1);
});

it('should flush any pending responders if a drop occurs', () => {
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

  const draggable = getByText('first');

  setElementFromPoint(draggable);
  mouse.lift(draggable);

  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDragUpdate).not.toHaveBeenCalled();

  extractClosestEdge.mockReturnValue('bottom');
  fireEvent.dragOver(getByText('second'));
  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDragUpdate).not.toHaveBeenCalled();

  extractClosestEdge.mockReturnValue('top');
  // Need to drag over the placeholder because the item is being dragged
  fireEvent.dragOver(getPlaceholder());
  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDragUpdate).not.toHaveBeenCalled();

  mouse.drop(draggable);

  expect(onDragStart).toHaveBeenCalledTimes(1);
  expect(onDragUpdate).toHaveBeenCalledTimes(2);

  const expectedResult: DropResult = {
    draggableId: 'draggable-0',
    mode: 'FLUID',
    type: 'DEFAULT',
    source: {
      droppableId: 'droppable',
      index: 0,
    },
    destination: {
      droppableId: 'droppable',
      index: 0,
    },
    combine: null,
    reason: 'DROP',
  };

  expect(onDragEnd).toHaveBeenCalledWith(expectedResult, expect.any(Object));
});

it('should work across multiple drags', () => {
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

    setElementFromPoint(draggable);
    mouse.lift(draggable);

    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDragUpdate).not.toHaveBeenCalled();

    extractClosestEdge.mockReturnValue('bottom');
    fireEvent.dragOver(getByText('second'));
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDragUpdate).not.toHaveBeenCalled();

    mouse.drop(draggable);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragUpdate).toHaveBeenCalledTimes(1);

    const expectedResult: DropResult = {
      draggableId: 'draggable-0',
      mode: 'FLUID',
      type: 'DEFAULT',
      source: {
        droppableId: 'droppable',
        index: 0,
      },
      destination: {
        droppableId: 'droppable',
        index: 1,
      },
      combine: null,
      reason: 'DROP',
    };

    expect(onDragEnd).toHaveBeenCalledWith(expectedResult, expect.any(Object));

    onDragStart.mockReset();
    onDragUpdate.mockReset();
    onDragEnd.mockReset();
  }
});
