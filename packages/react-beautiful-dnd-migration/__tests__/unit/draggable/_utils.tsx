import React from 'react';

import { render } from '@testing-library/react';
import type {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../src';

export type Item = {
  id: string;
};

export const defaultItems = Array.from(
  { length: 3 },
  (_, index): Item => ({
    id: `${index}`,
  }),
);

export function renderApp(items: Item[] = defaultItems) {
  const spy = jest.fn();

  render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="droppable">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map(({ id }, index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(provided, snapshot, rubric) => {
                  spy(provided, snapshot, rubric);
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      Draggable {id}
                    </div>
                  );
                }}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>,
  );

  function getCalls(
    draggableId: string,
  ): [DraggableProvided, DraggableStateSnapshot, DraggableRubric][] {
    return spy.mock.calls.filter(call => {
      const provided: DraggableProvided = call[0];
      return provided.draggableProps['data-rbd-draggable-id'] === draggableId;
    });
  }

  function getProvided(draggableId: string): DraggableProvided[] {
    const calls = getCalls(draggableId);
    return calls.map(call => call[0]);
  }

  return {
    getProvided,
  };
}
