import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

import { combine } from '../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../src/entry-point/element/adapter';

type ItemData = {
	id: string;
	label: string;
};

const defaultItems: ItemData[] = [
	{
		id: 'task-1',
		label: 'Organize a team-building event',
	},
	{
		id: 'task-2',
		label: 'Create and maintain office inventory',
	},
	{
		id: 'task-3',
		label: 'Update company website content',
	},
	{
		id: 'task-4',
		label: 'Plan and execute marketing campaigns',
	},
	{
		id: 'task-5',
		label: 'Coordinate employee training sessions',
	},
	{
		id: 'task-6',
		label: 'Manage facility maintenance',
	},
	{
		id: 'task-7',
		label: 'Organize customer feedback surveys',
	},
	{
		id: 'task-8',
		label: 'Coordinate travel arrangements',
	},
];

const containerStyles = xcss({
	maxWidth: '400px',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
});

const listItemContainerStyles = xcss({
	position: 'relative',
	backgroundColor: 'elevation.surface',
	borderWidth: 'border.width.0',
	borderBottomWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':last-of-type': {
		borderWidth: 'border.width.0',
	},
	padding: 'space.100',
});

const itemLabelStyles = xcss({
	flexGrow: 1,
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
});

const hoverStyles = xcss({
	backgroundColor: 'color.background.selected.hovered',
});

function ListItem({ itemData, index }: { itemData: ItemData; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const [isBeingDraggedOver, setIsBeingDraggedOver] = useState(false);

	useEffect(() => {
		invariant(ref.current);
		const element = ref.current;

		return combine(
			draggable({
				element,
			}),
			dropTargetForElements({
				element,
				getIsSticky: () => true,
				onDragEnter: () => setIsBeingDraggedOver(true),
				onDragStart: () => setIsBeingDraggedOver(true),
				onDragLeave: () => setIsBeingDraggedOver(false),
				onDrop: () => setIsBeingDraggedOver(false),
			}),
		);
	}, []);

	return (
		<Box
			ref={ref}
			xcss={[listItemContainerStyles, isBeingDraggedOver && hoverStyles]}
			testId={`list-item-${index}`}
		>
			{/*  Using a separate div here as we cannot set custom `data` attributes on the `Box` component */}
			<div
				data-testid={`list-item-${index}.drag-indicator`}
				data-is-dragged-over={isBeingDraggedOver}
			/>
			<Box xcss={itemLabelStyles}>{itemData.label}</Box>
		</Box>
	);
}

export default function StickinessExample() {
	const ref = useRef<HTMLDivElement>(null);

	const [isBeingDraggedOver, setIsBeingDraggedOver] = useState(false);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return dropTargetForElements({
			element,
			getIsSticky: () => true,
			onDragEnter: () => setIsBeingDraggedOver(true),
			onDragStart: () => setIsBeingDraggedOver(true),
			onDragLeave: () => setIsBeingDraggedOver(false),
			onDrop: () => setIsBeingDraggedOver(false),
		});
	}, []);

	return (
		<Inline space="space.100">
			{/* Using a separate div here as we cannot set custom `data` attributes on the `Stack` component */}
			<div data-testid="list-container" data-is-dragged-over={isBeingDraggedOver}>
				<Stack xcss={[containerStyles, isBeingDraggedOver && hoverStyles]} ref={ref}>
					{defaultItems.map((itemData, index) => (
						<ListItem key={itemData.id} itemData={itemData} index={index} />
					))}
				</Stack>
			</div>

			<div data-testid="element-without-drop-target">Element without drop target</div>
		</Inline>
	);
}
