import React from 'react';

import { SubtaskContainer } from '../primitives/linear/subtask-container';

import { SubtasksBaseTemplate, SubtasksBaseTemplateProps } from './_base';

type LinearTemplateProps = Omit<SubtasksBaseTemplateProps, 'Wrapper'>;

export function LinearTemplate({
  instanceId,
  DraggableSubtask,
}: LinearTemplateProps) {
  return (
    <SubtasksBaseTemplate
      instanceId={instanceId}
      DraggableSubtask={DraggableSubtask}
      Wrapper={SubtaskContainer}
    />
  );
}
