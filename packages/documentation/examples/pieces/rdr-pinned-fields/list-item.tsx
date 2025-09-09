import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
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

const listItemContainerStyles = xcss({
	position: 'relative',
	backgroundColor: 'color.background.neutral.subtle',
	'--action-opacity': 0,
	':hover': {
		// backgroundColor: 'color.background.neutral.subtle.hovered',
		// @ts-expect-error
		'--action-opacity': 1,
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':last-of-type': {
		borderWidth: '0',
		borderBottomLeftRadius: 'radius.small',
		borderBottomRightRadius: 'radius.small',
	},
});

const listItemStyles = xcss({
	position: 'relative',
	paddingBlock: 'space.100',
	paddingInline: 'space.150',
	height: '40px',
	// backgroundColor: 'elevation.surface',
});

/**
 * Removing padding for sortable items because the drag handle acts as padding.
 */
const sortableStyles = xcss({
	paddingLeft: 'space.0',
	cursor: 'grab',
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
	borderRadius: 'radius.small',
	backgroundColor: 'elevation.surface.overlay',
	maxWidth: '360px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
});

const labelStyles = xcss({
	font: 'font.body.UNSAFE_small',
	fontWeight: 'font.weight.semibold',
	color: 'color.text.subtle',
});

const fieldLayoutStyles = xcss({
	width: '100%',
	gap: 'space.100',
});

const dragHandleRegionStyles = xcss({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-important-styles -- Ignored via go/DSP-18766
	cursor: 'grab !important',
});

export function ListItem({ itemData, isSortable }: { itemData: ItemData; isSortable: boolean }) {
	const { getItemIndex, registerItem } = useListContext();

	const ref = useRef<HTMLDivElement>(null);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	const [draggableState, setDraggableState] = useState<DraggableState>(idleState);

	useEffect(() => {
		if (!isSortable) {
			return;
		}

		invariant(ref.current);

		const element = ref.current;

		const dragData = { id: itemData.id };

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
	}, [getItemIndex, isSortable, itemData, registerItem]);

	return (
		<Fragment>
			<Box ref={ref} xcss={listItemContainerStyles}>
				<Inline
					space="space.100"
					alignBlock="center"
					spread="space-between"
					grow="fill"
					xcss={[
						listItemStyles,
						/**
						 * We are applying the disabled effect to the inner element so that
						 * the border and drop indicator are not affected.
						 */
						draggableState.type === 'dragging' && listItemDisabledStyles,
						isSortable && sortableStyles,
					]}
				>
					<Grid templateColumns="35% 1fr" xcss={fieldLayoutStyles} alignItems="center">
						<Inline xcss={[isSortable && dragHandleRegionStyles]} alignBlock="center">
							{isSortable && (
								<DropdownMenu<HTMLButtonElement>
									trigger={({ triggerRef, ...triggerProps }) => (
										<DragHandleButton ref={triggerRef} {...triggerProps} />
									)}
									shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
								>
									<LazyDropdownContent itemData={itemData} />
								</DropdownMenu>
							)}
							<Box xcss={labelStyles}>{itemData.label}</Box>
						</Inline>
						<Box>{itemData.content}</Box>
					</Grid>
				</Inline>
				{closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
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
