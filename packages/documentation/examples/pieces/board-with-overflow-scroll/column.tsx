/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { Fragment, memo, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, type SerializedStyles } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import Heading from '@atlaskit/heading';
import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { autoScrollForExternal } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/external';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
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
import { token } from '@atlaskit/tokens';

import { type ColumnType } from '../../data/people';
import { cardGap, columnGap } from '../../util/constants';

import { Card } from './card';

const columnStyles = css({
	display: 'flex',
	width: 250,
	flexShrink: 0, // locking the column widths to force container scrolling
	flexDirection: 'column',
	background: token('elevation.surface.sunken', '#F7F8F9'),
	borderRadius: 'calc(var(--grid) * 2)',
	transition: `background ${mediumDurationMs}ms ${easeInOut}`,
	position: 'relative',
	paddingBottom: token('space.600', '0'), // a fake footer for now
});

const scrollContainerStyles = css({
	height: '100%',
	overflowY: 'auto',
});

const cardListStyles = css({
	display: 'flex',
	boxSizing: 'border-box',
	minHeight: '100%',
	padding: 'var(--grid)',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	gap: cardGap,
	flexDirection: 'column',
});

const columnHeaderStyles = css({
	display: 'flex',
	// width: 240,
	padding: 'calc(var(--grid) * 2) calc(var(--grid) * 2) calc(var(--grid) * 1)',
	justifyContent: 'space-between',
	flexDirection: 'row',
	color: token('color.text.subtlest', '#626F86'),
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

const stateStyles: { [key in State['type']]: SerializedStyles | undefined } = {
	idle: undefined,
	'is-column-over': undefined,
	'is-card-over': css({
		background: token('color.background.selected.hovered', '#CCE0FF'),
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
	'generate-column-preview': css({
		isolation: 'isolate',
	}),
	'generate-safari-column-preview': undefined,
};

export const Column = memo(function Column({ column }: { column: ColumnType }) {
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
			unsafeOverflowAutoScrollForElements({
				element: scrollContainerRef.current,
				canScroll: ({ source }) => source.data.type === 'card',
				getOverflow: () => ({
					fromTopEdge: {
						top: 6000,
						right: 0,
						left: 0,
					},
					fromRightEdge: {
						top: 0,
						right: 0,
						bottom: 0,
					},
					fromBottomEdge: {
						right: 0,
						bottom: 6000,
						left: 0,
					},
					fromLeftEdge: {
						top: 0,
						bottom: 0,
						left: 0,
					},
				}),
			}),
			autoScrollForExternal({
				element: scrollContainerRef.current,
			}),
		);
	}, [columnId]);

	return (
		<Fragment>
			<div css={[columnStyles, stateStyles[state.type]]} ref={columnRef}>
				<div css={columnHeaderStyles} ref={headerRef} data-testid={`column-${columnId}--header`}>
					<Heading size="xxsmall" as="span">
						{column.title}
					</Heading>
				</div>
				<div css={scrollContainerStyles} ref={scrollContainerRef}>
					<div css={cardListStyles} ref={cardListRef}>
						{column.items.map((item) => (
							<Card item={item} key={item.userId} />
						))}
					</div>
				</div>
				{state.type === 'is-column-over' && state.closestEdge && (
					<DropIndicator edge={state.closestEdge} gap={`${columnGap}px`} />
				)}
			</div>
			{state.type === 'generate-safari-column-preview'
				? createPortal(<SafariColumnPreview column={column} />, state.container)
				: null}
		</Fragment>
	);
});

const previewStyles = css({
	'--grid': '8px',
	width: 250,
	background: token('elevation.surface.sunken', '#F7F8F9'),
	borderRadius: 'calc(var(--grid) * 2)',
	padding: 'calc(var(--grid) * 2)',
});

function SafariColumnPreview({ column }: { column: ColumnType }) {
	return (
		<div css={[columnHeaderStyles, previewStyles]}>
			<Heading size="xxsmall" as="span">
				{column.title}
			</Heading>
		</div>
	);
}
