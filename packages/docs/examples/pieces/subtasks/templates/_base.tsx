import React, { ComponentType, Fragment, ReactNode } from 'react';

import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { DataItem, initialData } from '../data';

export type DraggableSubtaskProps = { index: number; item: DataItem };

export type SubtasksBaseTemplateProps = {
  instanceId: string;
  DraggableSubtask: ComponentType<DraggableSubtaskProps>;
  Wrapper?: ComponentType<{ children: ReactNode }>;
};

export function SubtasksBaseTemplate({
  instanceId,
  DraggableSubtask,
  Wrapper = Fragment,
}: SubtasksBaseTemplateProps) {
  const { data } = useTopLevelWiring({ initialData, type: instanceId });

  return (
    <Wrapper>
      {data.map((item, index) => (
        <DraggableSubtask key={item.id} index={index} item={item} />
      ))}
    </Wrapper>
  );
}
