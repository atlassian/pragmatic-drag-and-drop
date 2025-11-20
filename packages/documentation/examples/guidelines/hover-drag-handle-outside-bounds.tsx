import React, { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { keyframes } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Grid, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { ActionMenu } from './shared/action-menu';
import { DragPreview } from './shared/drag-preview';
import { type DraggableState } from './shared/types';

const dragCursorAnimation = keyframes({
	to: {
		cursor: 'grab',
	},
});

const listItemStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	borderRadius: 'radius.small',
	backgroundColor: 'elevation.surface',
	position: 'relative',
	marginInlineStart: 'space.100',
	'--show-drag-handle': 0,

	':hover': {
		// @ts-expect-error
		'--show-drag-handle': 1,
		backgroundColor: 'elevation.surface.hovered',
		animationName: dragCursorAnimation,

		/* instant animation */
		animationDuration: '0s',

		/* delay cursor change */
		animationDelay: '800ms',

		/* keep the end state when the animation ends */
		animationFillMode: 'forwards',
	},

	':focus-within': {
		// @ts-expect-error
		'--show-drag-handle': 1,
	},
});

const draggingStyles = xcss({
	opacity: 0.4,
});

const dragHandleStyles = xcss({
	position: 'absolute',
	pointerEvents: 'auto',
	display: 'flex',
	top: '0',
	bottom: '0',
	insetInlineStart: '0',
	opacity: 'var(--show-drag-handle, 0)',
	marginInlineStart: 'space.negative.150',
	flexDirection: 'column',
	justifyContent: 'center',
});

export function HoverDragHandleOutsideBounds(): React.JSX.Element {
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
			<Grid
				alignItems="center"
				columnGap="space.0"
				templateColumns="1fr auto"
				ref={draggableRef}
				testId="hover-drag-handle-outside-bounds"
				xcss={[listItemStyles, state.type === 'dragging' ? draggingStyles : undefined]}
			>
				<Box>Drag handle visible on hover (placed out of bounds)</Box>
				<ActionMenu />
				<Box xcss={dragHandleStyles}>
					<DragHandleVerticalIcon label="" size="small" />
				</Box>
			</Grid>

			{state.type === 'preview' ? createPortal(<DragPreview />, state.container) : null}
		</Fragment>
	);
}
