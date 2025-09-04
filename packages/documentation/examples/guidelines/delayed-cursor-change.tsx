/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, keyframes } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Grid, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { ActionMenu } from './shared/action-menu';
import { DragPreview } from './shared/drag-preview';
import { type DraggableState } from './shared/types';

const listItemStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	paddingInlineStart: 'space.0',
	borderRadius: 'radius.small',
	backgroundColor: 'elevation.surface',
	':hover': {
		backgroundColor: 'elevation.surface.hovered',
	},
});

const changeCursor = keyframes({
	to: {
		cursor: 'grab',
	},
});

const draggableStyles = css({
	'&:hover': {
		animationName: `${changeCursor}`,
		animationFillMode: 'forwards',
		animationDuration: '0ms',
		animationDelay: '800ms',
	},
});

const draggingStyles = xcss({
	opacity: 0.4,
});

export function DelayedCursorChange() {
	const draggableRef = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<DraggableState>({ type: 'idle' });

	useEffect(() => {
		const element = draggableRef.current;
		invariant(element);
		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					getOffset: pointerOutsideOfPreview({
						x: token('space.200', '16px'),
						y: token('space.100', '8px'),
					}),
					nativeSetDragImage,
					render({ container }) {
						setState({ type: 'preview', container });
						return () => setState({ type: 'dragging' });
					},
				});
			},
			onDrop() {
				setState({ type: 'idle' });
			},
		});
	}, []);

	return (
		<Fragment>
			<div css={[draggableStyles]}>
				<Grid
					ref={draggableRef}
					alignItems="center"
					columnGap="space.0"
					templateColumns="auto 1fr auto"
					xcss={[listItemStyles, state.type === 'dragging' ? draggingStyles : undefined]}
				>
					<Stack>
						<DragHandleVerticalIcon
							spacing="spacious"
							label="Drag list item"
							color={token('color.icon')}
							size="small"
						/>
					</Stack>
					<Box>
						{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
						<code>cursor:drag</code> delayed by <code>800ms</code>
					</Box>
					<ActionMenu />
				</Grid>
			</div>
			{state.type === 'preview' ? createPortal(<DragPreview />, state.container) : null}
		</Fragment>
	);
}
