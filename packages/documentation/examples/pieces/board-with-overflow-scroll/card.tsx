/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, Fragment, memo, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import { IconButton } from '@atlaskit/button/new';
import Heading from '@atlaskit/heading';
import MoreIcon from '@atlaskit/icon/core/migration/show-more-horizontal--more';
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
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { type Person } from '../../data/people';
import { cardGap } from '../../util/constants';

type DraggableState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement; rect: DOMRect }
	| { type: 'is-card-over'; closestEdge: Edge | null }
	| { type: 'is-file-over' }
	| { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

const noMarginStyles = css({ margin: 0 });
const noPointerEventsStyles = css({ pointerEvents: 'none' });
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

const stateStyles: {
	[Key in DraggableState['type']]?: ReturnType<typeof xcss> | undefined;
} = {
	dragging: xcss({
		opacity: 0.4,
	}),
	'is-file-over': xcss({
		backgroundColor: 'color.background.selected.hovered',
	}),
};

type CardPrimitiveProps = {
	item: Person;
	state: DraggableState;
};

const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(function CardPrimitive(
	{ item, state },
	ref,
) {
	const { avatarUrl, name, role, userId } = item;

	return (
		<Box
			ref={ref}
			testId={`item-${userId}`}
			backgroundColor="elevation.surface"
			padding="space.100"
			xcss={[containerStyles, stateStyles[state.type]]}
		>
			<span css={noPointerEventsStyles}>
				<Avatar size="large" src={avatarUrl} />
			</span>

			<Stack space="space.050" grow="fill">
				<Heading size="xsmall" as="span">
					{name}
				</Heading>
				<small css={noMarginStyles}>{role}</small>
			</Stack>
			<IconButton icon={MoreIcon} appearance="subtle" label="..." />
			{state.type === 'is-card-over' && state.closestEdge && (
				<DropIndicator edge={state.closestEdge} gap={`${cardGap}px`} />
			)}
		</Box>
	);
});

export const Card = memo(function Card({ item }: { item: Person }) {
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
			dropTargetForExternal({
				element: ref.current,
				onDragEnter: (args) => {
					setState({ type: 'is-file-over' });
				},
				onDragLeave: () => {
					setState(idleState);
				},
				onDrop: () => {
					setState(idleState);
				},
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

	return (
		<Fragment>
			<CardPrimitive ref={ref} item={item} state={state} />
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
						<CardPrimitive item={item} state={state} />
					</div>,
					state.container,
				)}
		</Fragment>
	);
});
