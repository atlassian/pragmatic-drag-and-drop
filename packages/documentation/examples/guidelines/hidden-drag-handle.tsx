import React, { Fragment, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import DragHandleVerticalIcon from '@atlaskit/icon/utility/migration/drag-handle-vertical--drag-handler';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Grid, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { ActionMenu } from './shared/action-menu';
import { DragPreview } from './shared/drag-preview';
import { type DraggableState } from './shared/types';

const listItemStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	borderRadius: 'border.radius',
	backgroundColor: 'elevation.surface',
});

const draggableStyles = xcss({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors
	':hover': {
		cursor: 'grab',
		backgroundColor: 'elevation.surface.hovered',
	},
});

const draggingStyles = xcss({
	opacity: 0.4,
});

const hiddenDragHandleStyles = xcss({
	display: 'flex',
	opacity: 'var(--show-drag-handle, 0)',
});

const noPaddingInlineStartStyles = xcss({
	paddingInlineStart: 'space.0',
});

const entityWithHiddenDragHandleStyles = xcss({
	'--show-drag-handle': 0,
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors
	':hover': {
		// @ts-expect-error
		'--show-drag-handle': 1,
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors
	':focus-within': {
		// @ts-expect-error
		'--show-drag-handle': 1,
	},
});

export function HiddenDragHandle() {
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
				templateColumns="auto 1fr auto"
				ref={draggableRef}
				xcss={[
					listItemStyles,
					noPaddingInlineStartStyles,
					draggableStyles,
					entityWithHiddenDragHandleStyles,
					state.type === 'dragging' ? draggingStyles : undefined,
				]}
			>
				<Box xcss={[hiddenDragHandleStyles]}>
					<DragHandleVerticalIcon
						spacing="spacious"
						label="Drag list item"
						color={token('color.icon')}
					/>
				</Box>
				<Box>
					Drag handle visible on <code>:hover</code> and <code>:focus-within</code>
				</Box>
				<ActionMenu />
			</Grid>
			{state.type === 'preview' ? createPortal(<DragPreview />, state.container) : null}
		</Fragment>
	);
}
