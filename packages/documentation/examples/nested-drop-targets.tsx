import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { durations, easeInOut } from '@atlaskit/motion';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Box, Grid, Inline, Stack, xcss } from '@atlaskit/primitives';

const dropTargetStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border.bold',
	padding: 'space.100',
	transitionProperty: 'background-color',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values
	transitionDuration: `${durations.medium}ms`,
	transitionTimingFunction: easeInOut,
	backgroundColor: 'elevation.surface',
});

const dropTargetContentStyles = xcss({
	padding: 'space.100',
	borderWidth: 'border.width',
	borderStyle: 'dashed',
	borderColor: 'color.border',
});

const isOverStyles = xcss({
	backgroundColor: 'color.background.selected.hovered',
});

const isDisabledStyles = xcss({
	backgroundColor: 'color.background.accent.red.subtler',
});

function DropTarget({ targetId, children }: { targetId: string; children?: React.ReactNode }) {
	const [state, setState] = useState<'idle' | 'is-over'>('idle');
	const [isSticky, setIsSticky] = useState<boolean>(false);
	const [isDropAllowed, setIsDropAllowed] = useState<boolean>(true);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return dropTargetForElements({
			element,
			getIsSticky: () => isSticky,
			canDrop: () => isDropAllowed,
			onDragEnter: () => {
				setState('is-over');
				console.log('is-over:', targetId);
			},
			onDragLeave: () => {
				setState('idle');
				console.log('is leaving', targetId);
			},
			onDrop: () => setState('idle'),
		});
	}, [targetId, isSticky, isDropAllowed]);

	return (
		<Box
			xcss={[
				dropTargetStyles,
				state === 'is-over' ? isOverStyles : !isDropAllowed ? isDisabledStyles : undefined,
			]}
			ref={ref}
		>
			<Inline xcss={dropTargetContentStyles} spread="space-between">
				<strong>{targetId}</strong>
				<Inline>
					<label>
						<Inline space="space.050">
							{/* eslint-disable-next-line @atlaskit/design-system/no-html-checkbox */}
							<input
								onChange={() => setIsDropAllowed((value) => !value)}
								type="checkbox"
								checked={isDropAllowed}
							></input>
							Drop allowed?
						</Inline>
					</label>
					<label>
						<Inline space="space.050">
							{/* eslint-disable-next-line @atlaskit/design-system/no-html-checkbox */}
							<input
								onChange={() => setIsSticky((value) => !value)}
								type="checkbox"
								checked={isSticky}
							></input>
							Sticky?
						</Inline>
					</label>
				</Inline>
			</Inline>
			{children ? <Stack space="space.100">{children}</Stack> : null}
		</Box>
	);
}

const draggableStyles = xcss({
	padding: 'space.100',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	backgroundColor: 'elevation.surface',
});

function Draggable() {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);
		return draggable({
			element,
		});
	}, []);

	return (
		<Box xcss={draggableStyles} ref={ref}>
			<strong>Drag me 👋</strong>
		</Box>
	);
}

export default function Example() {
	return (
		<Grid templateColumns="200px 1fr" gap="space.100">
			<Box>
				<Draggable />
			</Box>
			<Box>
				<DropTarget targetId="Grandparent 👵">
					<DropTarget targetId="Parent 1 👩">
						<DropTarget targetId="Child 1 🧒" />
						<DropTarget targetId="Child 2 👧" />
					</DropTarget>
					<DropTarget targetId="Parent 2 👨">
						<DropTarget targetId="Child 3 🧑‍🦱" />
						<DropTarget targetId="Child 4 👶" />
					</DropTarget>
				</DropTarget>
			</Box>
		</Grid>
	);
}
