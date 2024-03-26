// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/on-before-capture/additions.spec.js>

import React, { useState } from 'react';

import { render } from '@testing-library/react';
import type { DragStart } from 'react-beautiful-dnd';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import App from '../../_utils/app';
import { mouse } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

const noop = () => {};

const error = jest.spyOn(console, 'error').mockImplementation(noop);
const warn = jest.spyOn(console, 'warn').mockImplementation(noop);

afterEach(() => {
  error.mockClear();
  warn.mockClear();
});

it('should allow for additions to be made', () => {
  // adding a new Droppable and Draggable
  function AnotherChunk() {
    return (
      <Droppable droppableId="addition">
        {droppableProvided => (
          <div
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
          >
            <Draggable draggableId="addition-item" index={0}>
              {provided => (
                <div
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  Drag me!
                </div>
              )}
            </Draggable>
            {droppableProvided.placeholder};
          </div>
        )}
      </Droppable>
    );
  }

  function Root() {
    const [showAdditions, setShowAdditions] = useState(false);
    function onBeforeCapture() {
      setShowAdditions(true);
    }

    return (
      <App
        onBeforeCapture={onBeforeCapture}
        anotherChild={showAdditions ? <AnotherChunk /> : null}
      />
    );
  }

  const { getByTestId } = render(<Root />);
  const handle: HTMLElement = getByTestId('0');

  setElementFromPoint(handle);
  mouse.lift(handle);

  expect(isDragging(handle)).toBe(true);

  mouse.cancel(handle);
});

function getIndex(el: HTMLElement): number {
  return Number(el.getAttribute('data-index'));
}

it('should adjust captured values for any changes that impact that dragging item', () => {
  jest.useFakeTimers();

  // 1. Changing the `type` of the Droppable
  // 2. Adding and item before the dragging item to impact it's index
  const onDragStart = jest.fn();

  const spy = jest.fn();

  function Root() {
    const [items, setItems] = useState(['initial']);
    function onBeforeCapture() {
      spy();

      // adding the first item
      setItems(['first', 'initial']);
    }

    return (
      <DragDropContext
        onDragEnd={noop}
        onBeforeCapture={onBeforeCapture}
        onDragStart={onDragStart}
      >
        <Droppable droppableId="droppable">
          {droppableProvided => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {items.map((item: string, index: number) => (
                <Draggable draggableId={item} index={index} key={item}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-index={index}
                      data-testid={item}
                      data-is-dragging={snapshot.isDragging}
                      ref={provided.innerRef}
                    >
                      Drag me!
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder};
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  const { getByTestId, queryByTestId } = render(<Root />);
  const initial: HTMLElement = getByTestId('initial');

  // initially it had an index of 1
  expect(getIndex(initial)).toBe(0);
  // first item does not exist yet
  expect(queryByTestId('first')).toBe(null);

  setElementFromPoint(initial);
  mouse.lift(initial);

  // first item has been added
  expect(queryByTestId('first')).toBeTruthy();
  // initial is now dragging
  expect(isDragging(initial)).toBe(true);
  // initial index accounts for addition
  expect(getIndex(initial)).toBe(1);

  // flush onDragStart timer
  jest.runOnlyPendingTimers();

  // onDragStart called with correct new index
  const expected: DragStart = {
    draggableId: 'initial',
    mode: 'FLUID',
    type: 'DEFAULT',
    source: {
      index: 1,
      droppableId: 'droppable',
    },
  };
  expect(onDragStart.mock.calls[0][0]).toEqual(expected);

  jest.useRealTimers();
});
