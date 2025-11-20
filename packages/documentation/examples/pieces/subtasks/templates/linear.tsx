import React from 'react';

import { SubtaskContainer } from '../primitives/linear/subtask-container';

import { SubtasksBaseTemplate, type SubtasksBaseTemplateProps } from './_base';

type LinearTemplateProps = Omit<SubtasksBaseTemplateProps, 'Wrapper'>;

export function LinearTemplate({
	instanceId,
	DraggableSubtask,
}: LinearTemplateProps): React.JSX.Element {
	return (
		<SubtasksBaseTemplate
			instanceId={instanceId}
			DraggableSubtask={DraggableSubtask}
			Wrapper={SubtaskContainer}
		/>
	);
}
