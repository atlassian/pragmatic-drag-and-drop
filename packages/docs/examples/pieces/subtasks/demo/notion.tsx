/** @jsx jsx */

import { useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';

import { type DragState, useSortableField } from '../../hooks/use-sortable-field';
import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { initialData } from '../data';
import { DropIndicator } from '../primitives/notion/drop-indicator';
import {
  Subtask,
  type SubtaskAppearance,
  type SubtaskProps,
} from '../primitives/notion/subtask';
import { SubtaskContainer } from '../primitives/notion/subtask-container';

const type = 'subtasks--notion';

type DraggableSubtaskProps = Omit<SubtaskProps, 'dragState'> & {
  index: number;
};

const draggableSubtaskStyles = css({ position: 'relative' });

const stateToAppearanceMap: Record<DragState, SubtaskAppearance> = {
  idle: 'default',
  preview: 'overlay',
  dragging: 'disabled',
};

function DraggableSubtask({
  index,
  id,
  ...subtaskProps
}: DraggableSubtaskProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [dragHandle, setDragHandle] = useState<HTMLDivElement | null>(null);

  const { dragState, isHovering, closestEdge } = useSortableField({
    id,
    index,
    type,
    ref,
    dragHandle,
    shouldHideDropIndicatorForNoopTargets: false,
  });

  return (
    <Subtask
      ref={ref}
      {...subtaskProps}
      id={id}
      appearance={stateToAppearanceMap[dragState]}
      dragState={dragState}
      css={draggableSubtaskStyles}
      isHovering={isHovering}
      dragHandleRef={setDragHandle}
    >
      {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
    </Subtask>
  );
}

export default function SubtasksNotion() {
  const { data } = useTopLevelWiring({ initialData, type });

  return (
    <SubtaskContainer>
      {data.map((item, index) => (
        <DraggableSubtask
          key={item.id}
          id={item.id}
          title={item.title}
          index={index}
        />
      ))}
    </SubtaskContainer>
  );
}
