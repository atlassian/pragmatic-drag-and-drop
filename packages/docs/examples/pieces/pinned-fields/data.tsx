/** @jsx jsx */
import type { ReactNode } from 'react';

import { jsx } from '@emotion/react';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import { Date } from '@atlaskit/date';
import { SimpleTag } from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';

import MajorPriorityIcon from './major-priority-icon';

import { FieldContentWithIcon } from './index';

export type DataItem = {
	id: string;
	label: string;
	content: ReactNode;
};

export const initialData: DataItem[] = [
	{
		id: 'priority',
		label: 'Priority',
		content: <FieldContentWithIcon icon={<MajorPriorityIcon />}>Major</FieldContentWithIcon>,
	},
	{
		id: 'assignee',
		label: 'Assignee',
		content: (
			<FieldContentWithIcon
				icon={
					<Avatar
						size="small"
						src="https://upload.wikimedia.org/wikipedia/en/2/2d/SSU_Kirby_artwork.png"
					/>
				}
			>
				Kirby
			</FieldContentWithIcon>
		),
	},
	{
		id: 'reporter',
		label: 'Reporter',
		content: (
			<FieldContentWithIcon
				icon={
					<Avatar
						size="small"
						src="https://upload.wikimedia.org/wikipedia/en/d/db/Yoshi_%28Nintendo_character%29.png"
					/>
				}
			>
				Yoshi
			</FieldContentWithIcon>
		),
	},
	{
		id: 'labels',
		label: 'Labels',
		content: (
			<TagGroup>
				<SimpleTag text="jira" />
				<SimpleTag text="issue-view" />
			</TagGroup>
		),
	},
	{
		id: 'story-points',
		label: 'Story point estimate',
		content: <Badge>{3}</Badge>,
	},
	{ id: 'due-date', label: 'Due date', content: <Date value={0} /> },
];
