import React, { memo, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import Heading from '@atlaskit/heading';
import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
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
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Inline, Stack, type XCSS, xcss } from '@atlaskit/primitives';

import { type ColumnType } from '../../data/people';
import { columnGap } from '../../util/constants';

import { Card } from './card';

const columnStyles = xcss({
	width: '250px',
	backgroundColor: 'elevation.surface.sunken',
	borderRadius: 'border.radius.400',
	transition: `background ${mediumDurationMs}ms ${easeInOut}`,
	position: 'relative',
	paddingBottom: 'space.600', // a fake footer for now
});

const scrollContainerStyles = xcss({
	height: '100%',
	overflowY: 'auto',
});

const cardListStyles = xcss({
	boxSizing: 'border-box',
	minHeight: '100%',
	padding: 'space.100',
});

const columnHeaderStyles = xcss({
	padding: 'space.200',
	paddingBlockEnd: 'space.100',
	justifyContent: 'space-between',
	color: 'color.text.subtlest',
	userSelect: 'none',
});

type State =
	| { type: 'idle' }
	| { type: 'is-card-over' }
	| { type: 'generate-safari-column-preview'; container: HTMLElement }
	| { type: 'generate-column-preview' }
	| { type: 'is-column-over'; closestEdge: Edge | null };

// preventing re-renders
const idle: State = { type: 'idle' };
const isCardOver: State = { type: 'is-card-over' };

const stateStyles: { [key in State['type']]: XCSS | undefined } = {
	idle: undefined,
	'is-column-over': undefined,
	'is-card-over': xcss({
		backgroundColor: 'color.background.selected.hovered',
	}),
	/**
	 * **Browser bug workaround**
	 *
	 * _Problem_
	 * When generating a drag preview for an element
	 * that has an inner scroll container, the preview can include content
	 * vertically before or after the element
	 *
	 * _Fix_
	 * We make the column a new stacking context when the preview is being generated.
	 * We are not making a new stacking context at all times, as this _can_ mess up
	 * other layering components inside of your card
	 *
	 * _Fix: Safari_
	 * We have not found a great workaround yet. So for now we are just rendering
	 * a custom drag preview
	 */
	'generate-column-preview': xcss({
		isolation: 'isolate',
	}),
	'generate-safari-column-preview': undefined,
};

type ColumnProps = {
	column: ColumnType;
	isDraggingCard: boolean;
	selectedUserIds: string[];
	multiSelectTo: (userId: string) => void;
	toggleSelection: (userId: string) => void;
	toggleSelectionInGroup: (userId: string) => void;
};

export const Column = memo(function Column({
	column,
	selectedUserIds,
	isDraggingCard,
	multiSelectTo,
	toggleSelection,
	toggleSelectionInGroup,
}: ColumnProps) {
	const columnId = column.columnId;
	const columnRef = useRef<HTMLDivElement | null>(null);
	const headerRef = useRef<HTMLDivElement | null>(null);
	const cardListRef = useRef<HTMLDivElement | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<State>(idle);

	useEffect(() => {
		invariant(columnRef.current);
		invariant(headerRef.current);
		invariant(cardListRef.current);
		invariant(scrollContainerRef.current);
		return combine(
			draggable({
				element: columnRef.current,
				dragHandle: headerRef.current,
				getInitialData: () => ({ columnId, type: 'column' }),
				onGenerateDragPreview: ({ nativeSetDragImage }) => {
					const isSafari: boolean =
						navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome');

					if (!isSafari) {
						// TODO: scroll container preview is wacky when scrolled
						// scrolling the container to the start does not seem to fix it
						// Likely we will need to generate a custom preview
						setState({ type: 'generate-column-preview' });
						return;
					}
					setCustomNativeDragPreview({
						getOffset: centerUnderPointer,
						render: ({ container }) => {
							setState({ type: 'generate-safari-column-preview', container });
							return () => setState(idle);
						},
						nativeSetDragImage,
					});
				},
				onDragStart: () => {
					setState(idle);
				},
			}),
			dropTargetForElements({
				element: cardListRef.current,
				getData: () => ({ columnId }),
				canDrop: (args) => args.source.data.type === 'card',
				getIsSticky: () => true,
				onDragEnter: () => setState(isCardOver),
				onDragLeave: () => setState(idle),
				onDragStart: () => setState(isCardOver),
				onDrop: () => setState(idle),
			}),
			dropTargetForElements({
				element: columnRef.current,
				canDrop: (args) => args.source.data.type === 'column',
				getIsSticky: () => true,
				getData: ({ input, element }) => {
					const data = {
						columnId,
					};
					return attachClosestEdge(data, {
						input,
						element,
						allowedEdges: ['left', 'right'],
					});
				},
				onDragEnter: (args) => {
					setState({
						type: 'is-column-over',
						closestEdge: extractClosestEdge(args.self.data),
					});
				},
				onDrag: (args) => {
					// skip react re-render if edge is not changing
					setState((current) => {
						const closestEdge: Edge | null = extractClosestEdge(args.self.data);
						if (current.type === 'is-column-over' && current.closestEdge === closestEdge) {
							return current;
						}
						return {
							type: 'is-column-over',
							closestEdge,
						};
					});
				},
				onDragLeave: () => {
					setState(idle);
				},
				onDrop: () => {
					setState(idle);
				},
			}),
			autoScrollForElements({
				element: scrollContainerRef.current,
				canScroll: ({ source }) => source.data.type === 'card',
			}),
		);
	}, [columnId]);

	return (
		<>
			<Stack xcss={[columnStyles, stateStyles[state.type]]} ref={columnRef}>
				<Inline xcss={columnHeaderStyles} ref={headerRef} testId={`column-${columnId}--header`}>
					<Heading level="h300" as="span">
						{column.title}
					</Heading>
				</Inline>
				<Box xcss={scrollContainerStyles} ref={scrollContainerRef}>
					<Stack xcss={cardListStyles} space="space.100" ref={cardListRef}>
						{column.items.map((item) => (
							<Card
								item={item}
								key={item.userId}
								isDragging={isDraggingCard}
								isSelected={selectedUserIds.some((id) => id === item.userId)}
								selectedCount={selectedUserIds.length}
								multiSelectTo={multiSelectTo}
								toggleSelection={toggleSelection}
								toggleSelectionInGroup={toggleSelectionInGroup}
							/>
						))}
					</Stack>
				</Box>
				{state.type === 'is-column-over' && state.closestEdge && (
					<DropIndicator edge={state.closestEdge} gap={`${columnGap}px`} />
				)}
			</Stack>
			{state.type === 'generate-safari-column-preview'
				? createPortal(<SafariColumnPreview column={column} />, state.container)
				: null}
		</>
	);
});

const previewStyles = xcss({
	width: '250px',
	backgroundColor: 'elevation.surface.sunken',
	borderRadius: 'border.radius.400',
	padding: 'space.200',
});

function SafariColumnPreview({ column }: { column: ColumnType }) {
	return (
		<Box xcss={[columnHeaderStyles, previewStyles]}>
			<Heading level="h300" as="span">
				{column.title}
			</Heading>
		</Box>
	);
}
