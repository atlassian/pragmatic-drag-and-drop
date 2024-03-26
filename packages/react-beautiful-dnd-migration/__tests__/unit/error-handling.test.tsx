import React from 'react';

import { render } from '@testing-library/react';
import type {
  DragDropContextProps,
  DragUpdate,
  DropResult,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../src';

import { withWarn } from './ported-from-react-beautiful-dnd/_utils/console';
import {
  keyboard,
  mouse,
} from './ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from './ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

type AppProps = Partial<DragDropContextProps> & {
  shouldThrow?: boolean;
};

function getRuntimeError(): Event {
  return new window.ErrorEvent('error', {
    error: new Error('non-rbd'),
    cancelable: true,
  });
}

function App({ shouldThrow = false, ...props }: AppProps) {
  if (shouldThrow) {
    window.dispatchEvent(getRuntimeError());
  }

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
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  data-is-dragging={snapshot.isDragging}
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
  it(`should allow new drags on a draggable after being cancelled by a window error (${id})`, () => {
    const onDragStart = jest.fn();
    const onDragUpdate = jest.fn();
    const onDragEnd = jest.fn();

    const { getByText, rerender } = render(
      <App
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      />,
    );

    const draggable = getByText('first');

    control.lift(draggable);
    jest.runOnlyPendingTimers();
    expect(isDragging(draggable)).toBe(true);

    expect(onDragStart).toHaveBeenCalledTimes(1);

    withWarn(() => {
      rerender(
        <App
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
          shouldThrow
        />,
      );
    });

    expect(isDragging(draggable)).toBe(false);

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

    control.lift(draggable);
    jest.runOnlyPendingTimers();
    expect(isDragging(draggable)).toBe(true);

    expect(onDragStart).toHaveBeenCalledTimes(2);

    control.cancel(draggable);
    expect(onDragUpdate).toHaveBeenCalledTimes(2);
    expect(onDragEnd).toHaveBeenCalledTimes(2);
  });
});
