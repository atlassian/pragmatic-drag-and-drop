import React, { Fragment, type Ref, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import ChevronRightIcon from '@atlaskit/icon/core/migration/chevron-right';
import EditorMoreIcon from '@atlaskit/icon/core/migration/show-more-horizontal--editor-more';
import { fg } from '@atlaskit/platform-feature-flags';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Grid, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { DragPreview } from './shared/drag-preview';
import { type DraggableState } from './shared/types';

function GroupedActionMenu() {
	return (
		<DropdownMenu
			trigger={({ triggerRef, ...triggerProps }) => (
				<IconButton
					ref={triggerRef as Ref<HTMLButtonElement>}
					label="More actions"
					icon={EditorMoreIcon}
					spacing="compact"
					{...triggerProps}
				/>
			)}
			shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
		>
			<DropdownItemGroup>
				<DropdownMenu
					placement="right-start"
					// shouldRenderToParent
					trigger={({ triggerRef, ...triggerProps }) => (
						<DropdownItem
							{...triggerProps}
							ref={triggerRef}
							elemAfter={
								<ChevronRightIcon
									spacing="spacious"
									color={token('color.icon.subtle', '')}
									label=""
									size="small"
								/>
							}
						>
							<span>Move</span>
						</DropdownItem>
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
			</DropdownItemGroup>
			<DropdownItemGroup hasSeparator>
				<DropdownItem>Add label</DropdownItem>
				<DropdownItem>Change parent</DropdownItem>
			</DropdownItemGroup>
			<DropdownItemGroup hasSeparator>
				<DropdownItem>Remove from sprint</DropdownItem>
				<DropdownItem>Delete</DropdownItem>
			</DropdownItemGroup>
		</DropdownMenu>
	);
}

const listItemStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	paddingInlineStart: 'space.0',
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

export function EntireEntityIsDraggableWithGroupedItems(): React.JSX.Element {
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
				columnGap="space.0"
				templateColumns="auto 1fr auto"
				xcss={[
					listItemStyles,
					draggableStyles,
					state.type === 'dragging' ? draggingStyles : undefined,
				]}
			>
				<Stack>
					<DragHandleVerticalIcon
						spacing="spacious"
						label="Drag list item"
						color={token('color.icon')}
						size="small"
					/>
				</Stack>
				<Box>Entire entity is draggable (with grouped actions)</Box>
				<GroupedActionMenu />
			</Grid>
			{state.type === 'preview' ? createPortal(<DragPreview />, state.container) : null}
		</Fragment>
	);
}
