/** @jsx jsx */
import { forwardRef, memo } from 'react';

import { css, jsx } from '@emotion/react';
import { FixedSizeList } from 'react-window';
import invariant from 'tiny-invariant';

import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { token } from '@atlaskit/tokens';

import type { ColumnType, Item } from '../../data/tasks';
import { Card, CardInner } from '../card';
import { useDependency } from '../example-wrapper';

const columnStyles = css({
	display: 'flex',
	width: 250,
	flexDirection: 'column',
	background: token('elevation.surface.sunken', '#F7F8F9'),
	borderRadius: 'calc(var(--grid) * 2)',
	position: 'relative',
	overflow: 'hidden',
	marginRight: 'var(--column-gap)',
	height: '100%',
});

const columnHeaderStyles = css({
	display: 'flex',
	padding: 'calc(var(--grid) * 2) calc(var(--grid) * 2) calc(var(--grid) * 1)',
	justifyContent: 'space-between',
	flexDirection: 'row',
	color: token('color.text.subtlest', '#626F86'),
	userSelect: 'none',
});

const columnHeaderIdStyles = css({
	color: token('color.text.disabled', '#091E424F'),
	fontSize: '10px',
});

type ColumnProps = {
	column: ColumnType;
	droppableId: string;
	index: number;
};

const GUTTER_SIZE = 8;

const innerElementType = forwardRef<HTMLDivElement, { style: React.CSSProperties }>(
	({ style, ...rest }, ref) => {
		invariant(typeof style.height === 'number');

		return (
			<div
				style={{
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					...style,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					paddingLeft: GUTTER_SIZE,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					paddingTop: GUTTER_SIZE,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					paddingBottom: GUTTER_SIZE,
					height: style.height - GUTTER_SIZE,
					width: `calc(${style.width} - ${GUTTER_SIZE}px)`,
				}}
				ref={ref}
				{...rest}
			/>
		);
	},
);

const CardRenderer = ({
	index,
	style,
	data,
}: {
	index: number;
	style: React.CSSProperties;
	data: Item[];
}) => {
	const item = data[index];

	if (!item) {
		return null;
	}

	invariant(typeof style.left === 'number');
	invariant(typeof style.top === 'number');
	invariant(typeof style.height === 'number');

	return (
		<div
			style={{
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				...style,
				left: style.left + GUTTER_SIZE,
				width: `calc(100% - ${2 * GUTTER_SIZE}px)`,
				top: style.top + GUTTER_SIZE,
				height: style.height - GUTTER_SIZE,
			}}
		>
			<Card key={item.itemId} index={index} draggableId={item.itemId} item={item} />
		</div>
	);
};

export const Column = memo(({ column, droppableId, index }: ColumnProps) => {
	const { Draggable, Droppable } = useDependency();

	const columnId = column.columnId;

	return (
		<Draggable draggableId={`draggable-${column.columnId}`} index={index}>
			{(provided) => {
				return (
					<div css={columnStyles} ref={provided.innerRef} {...provided.draggableProps}>
						<div
							css={columnHeaderStyles}
							data-testid={`column-${columnId}--header`}
							{...provided.dragHandleProps}
						>
							<h6>{column.title}</h6>
							<span css={columnHeaderIdStyles}>ID: {column.columnId}</span>
						</div>
						<Droppable
							droppableId={droppableId}
							type="card"
							mode="virtual"
							renderClone={(provided, snapshot, rubric) => {
								const index = rubric.source.index;
								const item = column.items[index];

								return <CardInner provided={provided} snapshot={snapshot} item={item} />;
							}}
						>
							{(provided, snapshot) => {
								const itemCount = column.items.length;

								const style: React.CSSProperties = {
									transition: `background ${mediumDurationMs}ms ${easeInOut}`,
								};

								if (snapshot.isDraggingOver) {
									style.background = token('color.background.selected.hovered', '#CCE0FF');
								}

								return (
									<FixedSizeList
										height={440}
										itemCount={itemCount}
										itemSize={64}
										width={250}
										innerElementType={innerElementType}
										itemData={column.items}
										outerRef={provided.innerRef}
										// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
										style={style}
									>
										{CardRenderer}
									</FixedSizeList>
								);
							}}
						</Droppable>
					</div>
				);
			}}
		</Draggable>
	);
});
