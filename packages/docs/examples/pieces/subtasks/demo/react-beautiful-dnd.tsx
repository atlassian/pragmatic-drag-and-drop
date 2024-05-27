import React, { useCallback, useState } from 'react';

import {
  DragDropContext,
  Draggable,
  Droppable,
  type OnDragEndResponder,
} from 'react-beautiful-dnd';

import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { initialData } from '../data';
import { Subtask, type SubtaskProps } from '../primitives/subtask';
import { SubtaskContainer } from '../primitives/subtask-container';

type DraggableSubtaskProps = SubtaskProps & {
  index: number;
};

function DraggableSubtask({ index, ...subtaskProps }: DraggableSubtaskProps) {
  return (
    <Draggable draggableId={subtaskProps.id} index={index}>
      {(provided, snapshot) => (
        <Subtask
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          {...subtaskProps}
          appearance={snapshot.isDragging ? 'overlay' : 'default'}
        />
      )}
    </Draggable>
  );
}

export default function SubtaskReactBeautifulDnd() {
  const [data, setData] = useState(initialData);

  const onDragEnd: OnDragEndResponder = useCallback(
    ({ source, destination }) => {
      if (!destination) {
        return;
      }

      const startIndex = source.index;
      const finishIndex = destination.index;

      setData(data =>
        reorder({
          list: data,
          startIndex,
          finishIndex,
        }),
      );
    },
    [],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {provided => (
          <SubtaskContainer
            ref={provided.innerRef}
            hasContainerPadding
            {...provided.droppableProps}
          >
            {data.map((item, index) => (
              <DraggableSubtask
                key={item.id}
                id={item.id}
                title={item.title}
                index={index}
                isLastItem={index === data.length - 1}
              />
            ))}
            {provided.placeholder}
          </SubtaskContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
}
