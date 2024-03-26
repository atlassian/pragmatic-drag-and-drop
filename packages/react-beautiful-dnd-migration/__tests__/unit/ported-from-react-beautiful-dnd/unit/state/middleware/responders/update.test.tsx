// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/state/middleware/responders/update.spec.js>

import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../../integration/_utils/controls';
import { isDragging } from '../../../integration/_utils/helpers';

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

describe('onDragUpdate()', () => {
  const items = Array.from({ length: 2 }, (_, index) => ({
    draggableId: `draggable-${index}`,
    spy: jest.fn(),
  }));

  const onDragUpdate = jest.fn();

  function App() {
    return (
      <DragDropContext onDragEnd={() => {}} onDragUpdate={onDragUpdate}>
        <Droppable droppableId="droppable">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map(({ draggableId, spy }, index) => (
                <Draggable
                  key={draggableId}
                  draggableId={draggableId}
                  index={index}
                >
                  {(provided, snapshot, rubric) => {
                    spy(provided, snapshot, rubric);
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        data-is-dragging={snapshot.isDragging}
                      >
                        {draggableId}
                      </div>
                    );
                  }}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  afterEach(() => {
    mouse.cancel(document.body);
    onDragUpdate.mockClear();
  });

  it('should be called if the position has changed on move', () => {
    jest.useFakeTimers();

    const { getByText } = render(<App />);

    const firstItem = getByText('draggable-0');
    const secondItem = getByText('draggable-1');

    setElementFromPoint(firstItem);
    mouse.lift(firstItem);

    expect(isDragging(firstItem)).toBe(true);
    expect(onDragUpdate).not.toHaveBeenCalled();

    setElementFromPoint(secondItem);
    extractClosestEdge.mockReturnValue('bottom');
    fireEvent.dragOver(secondItem);

    // flush the onDragUpdate queue
    jest.runOnlyPendingTimers();

    expect(onDragUpdate).toHaveBeenCalledTimes(1);
    expect(onDragUpdate).toHaveBeenCalledWith(
      {
        draggableId: 'draggable-0',
        source: { droppableId: 'droppable', index: 0 },
        destination: { droppableId: 'droppable', index: 1 },
        combine: null,
        mode: 'FLUID',
        type: 'DEFAULT',
      },
      expect.any(Object),
    );

    jest.useRealTimers();
  });

  it('should not call onDragUpdate if there is no movement from the last update', () => {
    const { getByText } = render(<App />);

    const firstItem = getByText('draggable-0');

    setElementFromPoint(firstItem);
    mouse.lift(firstItem);

    expect(isDragging(firstItem)).toBe(true);
    expect(onDragUpdate).not.toHaveBeenCalled();

    fireEvent.dragOver(firstItem);
    expect(onDragUpdate).not.toHaveBeenCalled();
  });
});
