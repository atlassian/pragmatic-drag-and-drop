/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

import { combine } from '../src/entry-point/combine';
import {
	dropTargetForTextSelection,
	monitorForTextSelection,
} from '../src/entry-point/text-selection/adapter';

type DropTargetState = 'idle' | 'potential' | 'over';

const containerStyles = xcss({
	borderWidth: 'border.width.outline',
	borderRadius: 'border.radius',
	borderStyle: 'solid',
	flexGrow: 1,
	flexShrink: 1,
	flexBasis: 0,
	width: '0',
});

const dropTargetStateStyles: {
	[key in DropTargetState]: ReturnType<typeof xcss> | undefined;
} = {
	idle: undefined,
	over: xcss({ backgroundColor: 'color.background.selected' }),
	potential: xcss({
		backgroundColor: 'color.background.discovery',
		borderStyle: 'dashed',
		borderColor: 'color.border.discovery',
	}),
};

function DropTarget() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<DropTargetState>('idle');
	const [latestText, setLatestText] = useState<string>('(none)');

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return combine(
			dropTargetForTextSelection({
				element,
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
				onDrop: ({ source }) => {
					setLatestText(source.plain);
				},
			}),
			monitorForTextSelection({
				onDragStart: ({ location }) => {
					if (location.current.dropTargets[0]?.element === element) {
						setState('over');
					} else {
						setState('potential');
					}
				},
				onDrop: () => setState('idle'),
			}),
		);
	}, []);
	return (
		<Box
			padding="space.100"
			ref={ref}
			xcss={[containerStyles, dropTargetStateStyles[state]]}
			testId="drop-target"
		>
			<Stack space="space.100">
				<strong>Drop select text on me</strong>
				<Box>
					{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
					Latest dropped text: <code>"{latestText}"</code>
				</Box>
			</Stack>
		</Box>
	);
}

const layoutStyles = xcss({
	height: 'size.1000',
	width: '600px',
});

export default function TextSelectionDragging() {
	return (
		<Inline xcss={layoutStyles} space="space.100" alignBlock="stretch">
			<Box padding="space.100" xcss={containerStyles}>
				<span data-testid="text">
					Here is some text <em>for you</em> to select <strong>and drag</strong>
				</span>
			</Box>
			<DropTarget />
		</Inline>
	);
}
