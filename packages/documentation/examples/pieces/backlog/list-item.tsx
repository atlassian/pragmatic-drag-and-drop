import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { bindAll } from 'bind-event-listener';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import { IconButton } from '@atlaskit/button/new';
import { Checkbox } from '@atlaskit/checkbox';
import Story16Icon from '@atlaskit/icon-object/glyph/story/16';
import MoreIcon from '@atlaskit/icon/glyph/more';
import Lozenge from '@atlaskit/lozenge';
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
import { Box, Inline, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { useListContext } from './context';
import { type ItemData } from './data';
import { MinorPriorityIcon } from './minor-priority-icon';

const listItemContainerStyles = xcss({
	position: 'relative',
	borderWidth: 'border.width.0',
	borderBottomWidth: token('border.width', '1px'),
	borderStyle: 'solid',
	borderColor: 'color.border',
	backgroundColor: 'elevation.surface.raised',
	cursor: 'pointer',
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

const actionStyles = xcss({
	cursor: 'grab',
	opacity: 'var(--action-opacity)',
	':focus-within': {
		opacity: 1,
	},
});

const listItemContainerSelectedStyles = xcss({
	backgroundColor: 'color.background.selected',
	':hover': {
		backgroundColor: 'color.background.selected.hovered',
	},
});

const listItemStyles = xcss({
	position: 'relative',
	paddingLeft: 'space.100',
	paddingRight: 'space.100',
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
});

const subtlestTextStyles = xcss({ color: 'color.text.subtlest' });

export function ListItem({ itemData }: { itemData: ItemData }) {
	const { getItemIndex, registerItem } = useListContext();

	const ref = useRef<HTMLDivElement>(null);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	const [isChecked, setIsChecked] = useState(false);
	const onCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setIsChecked(event.currentTarget.checked);
	}, []);

	const [draggableState, setDraggableState] = useState<DraggableState>(idleState);

	useEffect(() => {
		invariant(ref.current);

		const element = ref.current;

		const dragData = { id: itemData.id, instance: 'backlog' };

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

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		let timeoutId: ReturnType<typeof setTimeout>;

		return bindAll(element, [
			{
				type: 'pointerenter',
				listener() {
					timeoutId = setTimeout(() => {
						element.style.setProperty('cursor', 'grab');
					}, 1000);
				},
			},
			{
				type: 'pointerleave',
				listener() {
					clearTimeout(timeoutId);
					element.style.removeProperty('cursor');
				},
			},
		]);
	}, []);

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
						isChecked && listItemContainerSelectedStyles,
					]}
				>
					<Inline alignBlock="center">
						<Inline xcss={actionStyles}>
							{/* <DragHandlerIcon
                label=""
                primaryColor={token('color.icon.subtle', '#626F86')}
              /> */}
							<Checkbox isChecked={isChecked} onChange={onCheckboxChange} />
						</Inline>
						<Inline space="space.050" alignBlock="center">
							<Story16Icon label="" />
							<Box xcss={subtlestTextStyles}>{itemData.id}</Box>
							<Box xcss={itemLabelStyles}>{itemData.label}</Box>
						</Inline>
					</Inline>
					<Inline alignBlock="center" space="space.100">
						<Lozenge>Todo</Lozenge>
						<Badge>0d</Badge>
						<MinorPriorityIcon />
						<Avatar size="small" />
						<Box xcss={actionStyles}>
							<IconButton icon={MoreIcon} label="more actions" />
						</Box>
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
