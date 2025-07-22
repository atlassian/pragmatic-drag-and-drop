import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import Lozenge from '@atlaskit/lozenge';
import { fg } from '@atlaskit/platform-feature-flags';
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Grid, Inline, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { useListContext } from './context';
import { type ItemData } from './data';
import { DragHandleButton } from './drag-handle-button';
import { SubtaskIcon } from './subtask-icon';

const listItemContainerStyles = xcss({
	position: 'relative',
	borderWidth: 'border.width.0',
	borderBottomWidth: token('border.width', '1px'),
	borderStyle: 'solid',
	borderColor: 'color.border',
	cursor: 'grab',
	// backgroundColor: 'elevation.surface.raised',
	'--action-opacity': 0,
	':hover': {
		backgroundColor: 'elevation.surface.raised.hovered',
		// @ts-expect-error
		'--action-opacity': 1,
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':last-of-type': {
		borderWidth: 'border.width.0',
	},
});

const listItemStyles = xcss({
	position: 'relative',
	paddingInline: 'space.100',
	height: '40px',
});

const listItemDisabledStyles = xcss({ opacity: 0.4 });

type DraggableState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement }
	| { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

const listItemPreviewStyles = xcss({
	paddingBlock: 'space.050',
	paddingInline: 'space.100',
	borderRadius: 'border.radius.100',
	backgroundColor: 'elevation.surface.overlay',
	maxWidth: '360px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
});

const itemLabelStyles = xcss({
	flexGrow: 1,
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
	cursor: 'pointer',
	':hover': {
		textDecoration: 'underline',
	},
});

const iconStackStyles = xcss({
	// @ts-expect-error
	':hover, :focus-within': {
		'--action-opacity': 1,
		'--icon-display': 'none',
	},
});

const linkStyles = xcss({
	color: 'color.link',
	fontSize: '12px',
	fontWeight: 'font.weight.medium',
	cursor: 'pointer',
	':hover': {
		textDecoration: 'underline',
	},
});

export function ListItem({ itemData }: { itemData: ItemData }) {
	const { getItemIndex, registerItem } = useListContext();

	const ref = useRef<HTMLDivElement>(null);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	const [draggableState, setDraggableState] = useState<DraggableState>(idleState);

	useEffect(() => {
		invariant(ref.current);

		const element = ref.current;

		const dragData = { id: itemData.id, instance: 'subtasks' };

		return combine(
			registerItem({ id: itemData.id, element }),
			draggable({
				element,
				getInitialData() {
					return { ...dragData, index: getItemIndex(itemData) };
				},
				onGenerateDragPreview({ nativeSetDragImage }) {
					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset: pointerOutsideOfPreview({
							x: token('space.200', '16px'),
							y: token('space.100', '8px'),
						}),
						render({ container }) {
							setDraggableState({ type: 'preview', container });

							return () => setDraggableState(draggingState);
						},
					});
				},
				onDragStart() {
					setDraggableState(draggingState);
				},
				onDrop() {
					setDraggableState(idleState);
				},
			}),
			dropTargetForElements({
				element,
				getData({ input }) {
					return attachClosestEdge(dragData, {
						element,
						input,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDrag({ self, source }) {
					const isSource = source.element === element;
					if (isSource) {
						setClosestEdge(null);
						return;
					}

					const closestEdge = extractClosestEdge(self.data);

					const sourceIndex = source.data.index;
					invariant(typeof sourceIndex === 'number');

					const selfIndex = getItemIndex({ id: itemData.id });

					const isItemBeforeSource = selfIndex === sourceIndex - 1;
					const isItemAfterSource = selfIndex === sourceIndex + 1;

					const isDropIndicatorHidden =
						(isItemBeforeSource && closestEdge === 'bottom') ||
						(isItemAfterSource && closestEdge === 'top');

					if (isDropIndicatorHidden) {
						setClosestEdge(null);
						return;
					}

					setClosestEdge(closestEdge);
				},
				onDragLeave() {
					setClosestEdge(null);
				},
				onDrop() {
					setClosestEdge(null);
				},
			}),
		);
	}, [getItemIndex, itemData, registerItem]);

	return (
		<Fragment>
			<Box ref={ref} xcss={listItemContainerStyles}>
				<Inline
					space="space.100"
					alignBlock="center"
					spread="space-between"
					xcss={[
						listItemStyles,
						/**
						 * We are applying the disabled effect to the inner element so that
						 * the border and drop indicator are not affected.
						 */
						draggableState.type === 'dragging' && listItemDisabledStyles,
					]}
				>
					<Inline space="space.100" alignBlock="center">
						<Grid
							templateAreas={['stack']}
							templateRows="16px"
							templateColumns="16px"
							xcss={iconStackStyles}
						>
							<div
								style={{
									// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
									gridArea: 'stack',
									// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
									opacity: 'calc(1 - var(--action-opacity))',
									// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
									display: 'var(--icon-display)',
								}}
							>
								<SubtaskIcon />
							</div>
							<div
								style={{
									// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
									gridArea: 'stack',
									// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
									marginTop: '-4px',
								}}
							>
								<DropdownMenu<HTMLButtonElement>
									trigger={({ triggerRef, ...triggerProps }) => (
										<DragHandleButton ref={triggerRef} {...triggerProps} />
									)}
									shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
								>
									<LazyDropdownContent itemData={itemData} />
								</DropdownMenu>
							</div>
						</Grid>
						<Box xcss={linkStyles}>{itemData.id}</Box>
						<Box xcss={itemLabelStyles}>{itemData.label}</Box>
					</Inline>
					<Inline alignBlock="center" space="space.100">
						<Badge>1</Badge>
						<Avatar size="small" />
						<Lozenge>Todo</Lozenge>
					</Inline>
				</Inline>
				{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
			</Box>
			{draggableState.type === 'preview' &&
				ReactDOM.createPortal(
					<Box xcss={listItemPreviewStyles}>{itemData.label}</Box>,
					draggableState.container,
				)}
		</Fragment>
	);
}

function LazyDropdownContent({ itemData }: { itemData: ItemData }) {
	const { getItemIndex, getItemPosition, reorderItem } = useListContext();

	const position = getItemPosition(itemData);

	const isMoveUpDisabled = position === 'first' || position === 'only';
	const isMoveDownDisabled = position === 'last' || position === 'only';

	const moveUp = useCallback(() => {
		const startIndex = getItemIndex(itemData);
		reorderItem({
			startIndex,
			indexOfTarget: startIndex - 1,
			closestEdgeOfTarget: null,
		});
	}, [getItemIndex, itemData, reorderItem]);

	const moveDown = useCallback(() => {
		const startIndex = getItemIndex(itemData);
		reorderItem({
			startIndex,
			indexOfTarget: startIndex + 1,
			closestEdgeOfTarget: null,
		});
	}, [getItemIndex, itemData, reorderItem]);

	return (
		<DropdownItemGroup>
			<DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
				Move up
			</DropdownItem>
			<DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
				Move down
			</DropdownItem>
		</DropdownItemGroup>
	);
}
