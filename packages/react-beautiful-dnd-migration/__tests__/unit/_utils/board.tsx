import React from 'react';

import type { Responders } from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../src';

const columns = [
  { id: 'A', items: [{ id: 'A0' }, { id: 'A1' }, { id: 'A2' }] },
  { id: 'B', items: [{ id: 'B0' }] },
  { id: 'C', items: [] },
];

type BoardProps = Partial<Responders>;

function noop() {}

export function Board({ onDragEnd = noop, ...responders }: BoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd} {...responders}>
      <Droppable droppableId="board" type="column">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {columns.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={`column-${column.id}`}
                index={index}
              >
                {provided => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <div {...provided.dragHandleProps}>Column {column.id}</div>
                    <Droppable droppableId={column.id}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {column.items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  data-is-over={snapshot.draggingOver}
                                  data-is-dragging={snapshot.isDragging}
                                  data-testid={item.id}
                                >
                                  Item {item.id}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
