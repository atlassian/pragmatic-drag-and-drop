import React, { type ReactElement } from 'react';

import CalendarIcon from '@atlaskit/icon/core/migration/calendar';
import CheckCircleOutlineIcon from '@atlaskit/icon/core/migration/check-circle--check-circle-outline';
import RecentIcon from '@atlaskit/icon/core/migration/clock--recent';
import EditIcon from '@atlaskit/icon/core/migration/edit';
import PersonIcon from '@atlaskit/icon/core/migration/person';
import LabelIcon from '@atlaskit/icon/core/migration/tag--label';
import IssuesIcon from '@atlaskit/icon/core/migration/work-items--issues';

import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';

export type DataItem = {
	id: string;
	label: string;
	icon: ReactElement;
};

const initialData: DataItem[] = [
	{
		icon: <PersonIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Created by',
		id: 'created-by',
	},
	{
		icon: <CalendarIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Due date',
		id: 'due',
	},
	{
		icon: <RecentIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Created on',
		id: 'created-on',
	},
	{
		icon: <EditIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Last modified on',
		id: 'last-modified-on',
	},
	{
		icon: <CheckCircleOutlineIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Completed on',
		id: 'completed-on',
	},
	{
		icon: <IssuesIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Projects',
		id: 'projects',
	},
	{
		icon: <LabelIcon color="currentColor" spacing="spacious" label="" />,
		label: 'Tags',
		id: 'tags',
	},
];

export type DraggableFieldProps = { index: number; item: DataItem };

type AsanaFieldsTemplateProps = {
	DraggableField: (props: DraggableFieldProps) => ReactElement;
	instanceId: string;
};

export default function AsanaFieldsTemplate({
	DraggableField,
	instanceId,
}: AsanaFieldsTemplateProps) {
	const { data } = useTopLevelWiring({ initialData, type: instanceId });
	return (
		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			{data.map((item, index) => (
				<DraggableField key={item.id} index={index} item={item} />
			))}
		</div>
	);
}
