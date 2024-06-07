/** @jsx jsx */
import { Fragment, type ReactElement } from 'react';

import { css, jsx } from '@emotion/react';

import Avatar from '@atlaskit/avatar';
import Lozenge from '@atlaskit/lozenge';
import { Inline } from '@atlaskit/primitives';

import type { Item, Status } from './types';

const customAvatarStyles = css({
	/**
	 * The purpose of this is to prevent dragging the image
	 */
	pointerEvents: 'none',
});

export function getField({ item, property }: { item: Item; property: keyof Item }): ReactElement {
	if (property === 'status') {
		return statusMap[item[property]];
	}
	if (property === 'assignee') {
		const person = item[property];
		return (
			<Inline space="space.100" alignBlock="center" grow="fill">
				<Avatar src={person.avatarUrl} size="small">
					{(props) => <span {...props} css={customAvatarStyles} />}
				</Avatar>
				<span>{person.name}</span>
			</Inline>
		);
	}
	return <Fragment>{item[property]}</Fragment>;
}

const propertyMap: { [key in keyof Item]: string } = {
	id: 'Id',
	description: 'Description',
	status: 'Status',
	assignee: 'Assignee',
};

export function getProperty(value: keyof Item): string {
	return propertyMap[value];
}

const statusMap: { [key in Status]: ReactElement } = {
	todo: <Lozenge appearance="new">Todo</Lozenge>,
	'in-progress': <Lozenge appearance="inprogress">In Progress</Lozenge>,
	done: <Lozenge appearance="success">Done</Lozenge>,
};

export function getStatus(value: Status): ReactElement {
	return statusMap[value];
}
