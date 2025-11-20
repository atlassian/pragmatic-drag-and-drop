import React, { Fragment, type Ref, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { fg } from '@atlaskit/platform-feature-flags';
import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Grid, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { DragPreview } from './shared/drag-preview';
import { type DraggableState } from './shared/types';

const listItemStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	borderRadius: 'radius.small',
	backgroundColor: 'elevation.surface',
});

const draggableStyles = xcss({
	':hover': {
		cursor: 'grab',
		backgroundColor: 'elevation.surface.hovered',
	},
});

const draggingStyles = xcss({
	opacity: 0.4,
});

export function EntireEntityIsDraggableWithDragHandleButton(): React.JSX.Element {
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
				ref={draggableRef}
				alignItems="center"
				columnGap="space.050"
				templateColumns="auto 1fr auto"
				xcss={[
					listItemStyles,
					draggableStyles,
					state.type === 'dragging' ? draggingStyles : undefined,
				]}
			>
				<DropdownMenu
					trigger={({ triggerRef, ...triggerProps }) => (
						<DragHandleButton
							ref={triggerRef as Ref<HTMLButtonElement>}
							{...triggerProps}
							label={`Reorder item`}
						/>
					)}
					shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
				>
					<DropdownItemGroup>
						<DropdownItem>Move to top</DropdownItem>
						<DropdownItem>Move up</DropdownItem>
						<DropdownItem>Move down</DropdownItem>
						<DropdownItem>Move to bottom</DropdownItem>
					</DropdownItemGroup>
				</DropdownMenu>
				<Box>Drag handle always visible (with drag handle button)</Box>
			</Grid>
			{state.type === 'preview' ? createPortal(<DragPreview />, state.container) : null}
		</Fragment>
	);
}
