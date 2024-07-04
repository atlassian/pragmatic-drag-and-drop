/** @jsx jsx */
import { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box-without-terminal';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Inline, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { minColumnWidth } from './constants';
import { RowMenuButton } from './menu-button';
import { getField } from './render-pieces';
import { TableContext } from './table-context';
import type { Item } from './types';

const rowStyles = css({
	// Needed for our drop indicator
	position: 'relative',
	'&:hover': {
		background: token('color.background.input.hovered', 'red'),
	},
});

const textOverflowStyles = css({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'preview';
			container: HTMLElement;
	  }
	| {
			type: 'is-over';
			closestEdge: Edge | null;
	  };

/**
 * Memoizing each Row so that row reorders don't need to rerender the entire
 * table.
 *
 * Column rerenders still need to rerender every row. Both could be optimized
 * further, such as by using virtualization.
 */
export const Row = memo(function Row({
	item,
	index,
	properties,
	amountOfRows,
}: {
	item: Item;
	index: number;
	properties: (keyof Item)[];
	amountOfRows: number;
}) {
	const ref = useRef<HTMLTableRowElement | null>(null);
	const dragHandleRef = useRef<HTMLButtonElement>(null);
	const { register, instanceId } = useContext(TableContext);
	const [state, setState] = useState<State>({ type: 'idle' });

	useEffect(() => {
		const element = ref.current;
		invariant(element);
		const unregister = register({ item, element, index });
		return unregister;
	}, [register, item, index]);

	// Pragmatic drag and drop
	useEffect(() => {
		const element = ref.current;
		invariant(element);
		const dragHandle = dragHandleRef.current;
		invariant(dragHandle);
		return combine(
			draggable({
				element,
				dragHandle,
				getInitialData() {
					return { type: 'item-row', item, index, instanceId };
				},
				onGenerateDragPreview({ nativeSetDragImage }) {
					// We need to make sure that the element not obfuscated by the sticky header
					setCustomNativeDragPreview({
						getOffset: pointerOutsideOfPreview({
							x: token('space.250', '0'),
							y: token('space.250', '0'),
						}),
						render({ container }) {
							setState({ type: 'preview', container });
							return () => setState({ type: 'idle' });
						},
						nativeSetDragImage,
					});
				},
			}),
			dropTargetForElements({
				element,
				canDrop({ source }) {
					return (
						source.data.instanceId === instanceId &&
						source.data.type === 'item-row' &&
						source.data.item !== item
					);
				},
				getData({ input, element }) {
					const data = { item, index };
					return attachClosestEdge(data, {
						input,
						element,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDragEnter(args) {
					setState({
						type: 'is-over',
						closestEdge: extractClosestEdge(args.self.data),
					});
				},
				onDrag(args) {
					const closestEdge: Edge | null = extractClosestEdge(args.self.data);

					// only update react state if the `closestEdge` changes
					setState((current) => {
						if (current.type !== 'is-over') {
							return current;
						}
						if (current.closestEdge === closestEdge) {
							return current;
						}
						return {
							type: 'is-over',
							closestEdge,
						};
					});
				},
				onDragLeave() {
					setState({ type: 'idle' });
				},
				onDrop() {
					setState({ type: 'idle' });
				},
			}),
		);
		/**
		 * Using `properties` as a dependency to ensure that the `draggable()` call
		 * is rerun when the column order changes. This is because the `dragHandle`
		 * value will change when the column order changes.
		 *
		 * If we do not rerun the `draggable()` call then dragging will not work
		 * because the `dragHandle` reference will be stale.
		 *
		 * This could be avoided by making a separate cell component that takes a
		 * prop such as `shouldRenderDragHandle`. Then you could call the
		 * `draggable` setup in the cell, using `shouldRenderDragHandle` as a
		 * dependency.
		 *
		 * Using the cell-based approach could be preferable if you have stricter
		 * performance needs, and would allow for optimizations such as memoization.
		 */
	}, [instanceId, item, index, properties]);

	return (
		<Fragment>
			<tr draggable ref={ref} css={rowStyles}>
				{properties.map((property, columnIndex) => (
					<td key={property} css={textOverflowStyles}>
						{
							/**
							 * Rendering this in only the first column of each row
							 */
							columnIndex === 0 && (
								<RowMenuButton ref={dragHandleRef} rowIndex={index} amountOfRows={amountOfRows} />
							)
						}

						{getField({ item, property })}
						{state.type === 'is-over' && state.closestEdge ? (
							<DropIndicator edge={state.closestEdge} />
						) : null}
					</td>
				))}
			</tr>
			{state.type === 'preview'
				? createPortal(<Preview item={item} properties={properties} />, state.container)
				: null}
		</Fragment>
	);
});

const previewStyles = xcss({
	borderRadius: 'border.radius',
});

const previewItemStyles = css({
	/**
	 * Each column in the preview will be no wider than a fully condensed column
	 */
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	maxWidth: minColumnWidth,
});

function Preview({ item, properties }: { item: Item; properties: (keyof Item)[] }) {
	return (
		<Box backgroundColor="elevation.surface" padding="space.100" xcss={previewStyles}>
			<Inline alignBlock="center" space="space.100">
				{properties.map((property) => (
					<div key={property} css={[textOverflowStyles, previewItemStyles]}>
						{getField({ item, property })}
					</div>
				))}
			</Inline>
		</Box>
	);
}
