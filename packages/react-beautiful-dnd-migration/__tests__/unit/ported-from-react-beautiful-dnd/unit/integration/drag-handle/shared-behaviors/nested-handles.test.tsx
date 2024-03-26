import React from 'react';

import { render } from '@testing-library/react';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '../../../../../../../src';
import { setup } from '../../../../../_utils/setup';
import { Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
  setup();
});

function Board() {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="board" type="column">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Draggable draggableId="column--draggable" index={0}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  data-testid="column"
                  data-is-dragging={snapshot.isDragging}
                >
                  <Droppable droppableId="column--draggable">
                    {provided => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <Draggable draggableId="card" index={0}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              data-is-over={snapshot.draggingOver}
                              data-is-dragging={snapshot.isDragging}
                              data-testid="card"
                            >
                              Card
                            </div>
                          )}
                        </Draggable>

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </Draggable>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

forEachSensor((control: Control) => {
  it('should not start a drag on a parent if a child drag handle has already received the event', () => {
    const { getByTestId } = render(<Board />);
    const cardHandle: HTMLElement = getByTestId('card');
    const columnHandle: HTMLElement = getByTestId('column');

    simpleLift(control, cardHandle);

    expect(isDragging(cardHandle)).toBe(true);
    expect(isDragging(columnHandle)).toBe(false);
  });
  it('should start a drag on a parent the event is trigged on the parent', () => {
    const { getByTestId } = render(<Board />);
    const cardHandle: HTMLElement = getByTestId('card');
    const columnHandle: HTMLElement = getByTestId('column');

    simpleLift(control, columnHandle);

    expect(isDragging(columnHandle)).toBe(true);
    expect(isDragging(cardHandle)).toBe(false);
  });
});
