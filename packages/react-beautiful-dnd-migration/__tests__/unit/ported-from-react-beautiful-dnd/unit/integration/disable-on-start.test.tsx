import React, { useCallback, useState } from 'react';

import { act, render } from '@testing-library/react';
import type {
  DraggableProvided,
  DragStart,
  DragUpdate,
  DroppableProvided,
  OnDragEndResponder,
  OnDragStartResponder,
  OnDragUpdateResponder,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../../../src';

import { keyboard, mouse } from './_utils/controls';

HTMLElement.prototype.scrollIntoView = jest.fn();

type AppProps = {
  onDragStart: OnDragStartResponder;
  onDragUpdate: OnDragUpdateResponder;
  onDragEnd: OnDragEndResponder;
};

function App(props: AppProps) {
  const [isDropDisabled, setIsDropDisabled] = useState(false);

  const onDragStart: OnDragStartResponder = useCallback(
    (...args) => {
      props.onDragStart(...args);
      setIsDropDisabled(true);
    },
    [props],
  );

  const onDragUpdate: OnDragUpdateResponder = useCallback(
    (...args) => {
      props.onDragUpdate(...args);
    },
    [props],
  );

  const onDragEnd: OnDragEndResponder = useCallback(
    (...args) => {
      props.onDragEnd(...args);
      setIsDropDisabled(false);
    },
    [props],
  );

  return (
    <DragDropContext
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >
      <Droppable
        droppableId="droppable"
        direction="horizontal"
        isDropDisabled={isDropDisabled}
      >
        {(droppableProvided: DroppableProvided) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            <Draggable draggableId="draggable" index={0}>
              {(draggableProvided: DraggableProvided) => (
                <div
                  ref={draggableProvided.innerRef}
                  data-testid="drag-handle"
                  {...draggableProvided.draggableProps}
                  {...draggableProvided.dragHandleProps}
                >
                  Drag me!
                </div>
              )}
            </Draggable>
            {droppableProvided.placeholder}
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
  it(`should allow the disabling of a droppable in onDragStart (${id})`, () => {
    const responders = {
      onDragStart: jest.fn(),
      onDragUpdate: jest.fn(),
      onDragEnd: jest.fn(),
    };
    const { getByTestId, unmount } = render(<App {...responders} />);
    const handle: HTMLElement = getByTestId('drag-handle');

    control.lift(handle);
    // flush responder
    act(() => {
      jest.runOnlyPendingTimers();
    });

    const start: DragStart = {
      draggableId: 'draggable',
      source: {
        droppableId: 'droppable',
        index: 0,
      },
      type: 'DEFAULT',
      mode,
    };
    expect(responders.onDragStart).toHaveBeenCalledWith(
      start,
      expect.any(Object),
    );

    // onDragUpdate will occur after setTimeout
    expect(responders.onDragUpdate).not.toHaveBeenCalled();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    // an update should be fired as the home location has changed
    const update: DragUpdate = {
      ...start,
      // no destination as it is now disabled
      destination: null,
      combine: null,
    };
    expect(responders.onDragUpdate).toHaveBeenCalledWith(
      update,
      expect.any(Object),
    );

    control.cancel(handle);
    unmount();
  });
});
