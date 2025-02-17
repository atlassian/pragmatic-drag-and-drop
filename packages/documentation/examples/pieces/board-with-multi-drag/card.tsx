import React, {
	forwardRef,
	type KeyboardEvent,
	memo,
	type MouseEvent,
	type MouseEventHandler,
	useEffect,
	useRef,
	useState,
} from 'react';

import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Heading from '@atlaskit/heading';
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
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { type Person } from '../../data/people';
import { cardGap } from '../../util/constants';

type DraggableState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement; rect: DOMRect }
	| { type: 'is-card-over'; closestEdge: Edge | null }
	| { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

const noMarginStyles = xcss({ margin: 'space.0' });
const noPointerEventsStyles = xcss({ pointerEvents: 'none' });
const containerStyles = xcss({
	width: '100%',
	borderRadius: 'border.radius.200',
	boxShadow: 'elevation.shadow.raised',
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: 'auto 1fr auto',
	gap: 'space.100',
	alignItems: 'center',
});
const selectionCountStyles = xcss({
	right: 'space.negative.100',
	top: 'space.negative.100',
	color: 'color.text.inverse',
	backgroundColor: 'color.background.accent.gray.subtle',
	borderRadius: 'border.radius.circle',
	height: 'size.200',
	width: 'size.200',
	lineHeight: '1.5rem',
	position: 'absolute',
	textAlign: 'center',
	fontWeight: 'font.weight.semibold',
});

const stateStyles: {
	[Key in DraggableState['type']]?: ReturnType<typeof xcss> | undefined;
} = {
	dragging: xcss({
		opacity: 0,
	}),
};

const selectedStyles = xcss({
	backgroundColor: 'color.background.selected',
});

const draggingStyles = xcss({
	opacity: 0.4,
});

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

type CardPrimitiveProps = {
	isDragging?: boolean;
	isSelected: boolean;
	item: Person;
	state: DraggableState;
	onClick?: MouseEventHandler;
};

const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(function CardPrimitive(
	{ item, isDragging, isSelected, state, onClick },
	ref,
) {
	const { avatarUrl, name, role, userId } = item;

	return (
		<Box
			ref={ref}
			testId={`item-${userId}`}
			backgroundColor="elevation.surface"
			padding="space.100"
			onClick={onClick}
			role="button"
			tabIndex={0}
			xcss={[
				containerStyles,
				stateStyles[state.type],
				isSelected && selectedStyles,
				isSelected && isDragging && draggingStyles,
			]}
		>
			<Box as="span" xcss={noPointerEventsStyles}>
				<Avatar size="large" src={avatarUrl} />
			</Box>
			<Stack space="space.050" grow="fill">
				<Heading size="xsmall" as="span">
					{name}
				</Heading>
				<Box as="small" xcss={noMarginStyles}>
					{role}
				</Box>
			</Stack>
			{state.type === 'is-card-over' && state.closestEdge && (
				<DropIndicator edge={state.closestEdge} gap={`${cardGap}px`} />
			)}
		</Box>
	);
});

// Determines if the platform specific toggle selection in group key was used
const wasToggleInSelectionGroupKeyUsed = (event: MouseEvent | KeyboardEvent) => {
	const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
	return isUsingWindows ? event.ctrlKey : event.metaKey;
};

// Determines if the multiSelect key was used
const wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) => event.shiftKey;

type CardProps = {
	item: Person;
	isDragging: boolean;
	isSelected: boolean;
	selectedCount: number;
	multiSelectTo: (id: string) => void;
	toggleSelection: (id: string) => void;
	toggleSelectionInGroup: (id: string) => void;
};

export const Card = memo(function Card({
	item,
	isDragging,
	isSelected,
	selectedCount,
	multiSelectTo,
	toggleSelection,
	toggleSelectionInGroup,
}: CardProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const { userId } = item;
	const [state, setState] = useState<DraggableState>(idleState);

	useEffect(() => {
		invariant(ref.current);
		return combine(
			draggable({
				element: ref.current,
				getInitialData: () => ({ type: 'card', itemId: userId }),
				onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
					const rect = source.element.getBoundingClientRect();
					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset() {
							/**
							 * This offset ensures that the preview is positioned relative to
							 * the cursor based on where you drag from.
							 *
							 * This creates the effect of it being picked up.
							 */
							return {
								x: location.current.input.clientX - rect.x,
								y: location.current.input.clientY - rect.y,
							};
						},
						render({ container }) {
							setState({ type: 'preview', container, rect });
							return () => setState(draggingState);
						},
					});
				},
				onDragStart: () => setState(draggingState),
				onDrop: () => setState(idleState),
			}),
			dropTargetForElements({
				element: ref.current,
				canDrop: (args) => args.source.data.type === 'card',
				getIsSticky: () => true,
				getData: ({ input, element }) => {
					const data = { type: 'card', itemId: userId };
					return attachClosestEdge(data, {
						input,
						element,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDragEnter: (args) => {
					if (args.source.data.itemId === userId) {
						return;
					}
					const closestEdge: Edge | null = extractClosestEdge(args.self.data);
					setState({
						type: 'is-card-over',
						closestEdge,
					});
				},
				onDrag: (args) => {
					if (args.source.data.itemId === userId) {
						return;
					}
					const closestEdge: Edge | null = extractClosestEdge(args.self.data);
					// conditionally update react state if change has occurred
					setState((current) => {
						if (current.type !== 'is-card-over') {
							return current;
						}
						if (current.closestEdge === closestEdge) {
							return current;
						}
						return {
							type: 'is-card-over',
							closestEdge,
						};
					});
				},
				onDragLeave: () => {
					setState(idleState);
				},
				onDrop: () => {
					setState(idleState);
				},
			}),
		);
	}, [item, userId]);

	const performAction = (event: KeyboardEvent | MouseEvent) => {
		if (wasToggleInSelectionGroupKeyUsed(event)) {
			toggleSelectionInGroup(userId);
			return;
		}

		if (wasMultiSelectKeyUsed(event)) {
			multiSelectTo(userId);
			return;
		}

		toggleSelection(userId);
	};

	const handleCardClick = (event: MouseEvent) => {
		if (event.defaultPrevented) {
			return;
		}

		if (event.button !== primaryButton) {
			return;
		}

		// marking the event as used
		event.preventDefault();

		performAction(event);
	};

	return (
		<>
			<CardPrimitive
				ref={ref}
				item={item}
				state={state}
				isDragging={isDragging}
				isSelected={isSelected}
				onClick={handleCardClick}
			/>
			{state.type === 'preview' &&
				ReactDOM.createPortal(
					<div
						style={{
							/**
							 * Ensuring the preview has the same dimensions as the original.
							 *
							 * Using `border-box` sizing here is not necessary in this
							 * specific example, but it is safer to include generally.
							 */
							// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
							boxSizing: 'border-box',
							width: state.rect.width,
							height: state.rect.height,
						}}
					>
						<CardPrimitive item={item} state={state} isSelected />
						{selectedCount > 0 && <Box xcss={selectionCountStyles}>{selectedCount}</Box>}
					</div>,
					state.container,
				)}
		</>
	);
});
