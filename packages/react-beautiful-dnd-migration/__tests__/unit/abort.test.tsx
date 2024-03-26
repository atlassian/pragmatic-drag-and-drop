import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type {
  DragDropContextProps,
  DragUpdate,
  DropResult,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../src';

import { setElementFromPoint } from './_util';
import {
  keyboard,
  mouse,
} from './ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

function App(props: Partial<DragDropContextProps>) {
  return (
    <DragDropContext onDragEnd={() => {}} {...props}>
      <Droppable droppableId="droppable">
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid="droppable"
          >
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

const cases = [
  { id: 'mouse', control: mouse, mode: 'FLUID' },
  { id: 'keyboard', control: keyboard, mode: 'SNAP' },
] as const;

cases.forEach(({ id, control, mode }) => {
  it(`should publish an update for null destination on cancel (${id})`, () => {
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
    control.lift(draggable);

    jest.runOnlyPendingTimers();
    expect(onDragStart).toHaveBeenCalledTimes(1);

    control.cancel(draggable);

    // there should be an update as the destination becomes `null`
    const expectedUpdate: DragUpdate = {
      combine: null,
      destination: null,
      draggableId: 'draggable-0',
      mode,
      source: { droppableId: 'droppable', index: 0 },
      type: 'DEFAULT',
    };
    expect(onDragUpdate).toHaveBeenCalledTimes(1);
    expect(onDragUpdate).toHaveBeenCalledWith(
      expectedUpdate,
      expect.any(Object),
    );

    const expectedResult: DropResult = {
      type: 'DEFAULT',
      mode,
      draggableId: 'draggable-0',
      source: {
        droppableId: 'droppable',
        index: 0,
      },
      destination: null,
      combine: null,
      reason: 'CANCEL',
    };
    expect(onDragEnd).toHaveBeenCalledWith(expectedResult, expect.any(Object));
  });
});

it(`should not publish a redundant update for null destination on cancel (mouse)`, () => {
  const onDragStart = jest.fn();
  const onDragUpdate = jest.fn();
  const onDragEnd = jest.fn();

  const { getByTestId, getByText } = render(
    <App
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    />,
  );

  const draggable = getByText('first');

  setElementFromPoint(draggable);
  mouse.lift(draggable);

  fireEvent.dragLeave(getByTestId('droppable'));

  jest.runOnlyPendingTimers();
  expect(onDragStart).toHaveBeenCalledTimes(1);

  // there should be an update as the destination becomes `null`
  const expectedUpdate: DragUpdate = {
    combine: null,
    destination: null,
    draggableId: 'draggable-0',
    mode: 'FLUID',
    source: { droppableId: 'droppable', index: 0 },
    type: 'DEFAULT',
  };
  expect(onDragUpdate).toHaveBeenCalledTimes(1);
  expect(onDragUpdate).toHaveBeenCalledWith(expectedUpdate, expect.any(Object));
  onDragUpdate.mockReset();

  mouse.cancel(draggable);

  // there should be no redundant update, as the destination is already `null`
  expect(onDragUpdate).not.toHaveBeenCalled();

  const expectedResult: DropResult = {
    type: 'DEFAULT',
    mode: 'FLUID',
    draggableId: 'draggable-0',
    source: {
      droppableId: 'droppable',
      index: 0,
    },
    destination: null,
    combine: null,
    reason: 'CANCEL',
  };
  expect(onDragEnd).toHaveBeenCalledWith(expectedResult, expect.any(Object));
});
