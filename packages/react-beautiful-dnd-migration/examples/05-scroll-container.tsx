/**
 * @jsxRuntime classic
 * @jsx jsx
 * @jsxFrag
 */
import React, { useCallback, useMemo, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import type { DropResult } from 'react-beautiful-dnd';

import Button from '@atlaskit/button/new';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { token } from '@atlaskit/tokens';

import { ExampleWrapper, useDependency } from './pieces/example-wrapper';

type ItemData = {
	id: string;
	content: string;
};

const initialData: ItemData[] = Array.from({ length: 15 }, (_, index) => {
	return {
		id: `id-${index}`,
		content: `Item ${index}`,
	};
});

const cardStyles = css({
	width: 200,
	marginBottom: 'var(--grid)',
	padding: 'var(--grid)',
	backgroundColor: token('elevation.surface.raised', '#FFF'),
	boxShadow: token('elevation.shadow.raised', '0px 1px 1px #091E4240, 0px 0px 1px #091E424F'),
	borderRadius: 3,
});

function Card({ quote, index }: { quote: ItemData; index: number }) {
	const { Draggable } = useDependency();

	return (
		<Draggable draggableId={quote.id} index={index}>
			{(provided) => (
				<div
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					css={cardStyles}
					ref={provided.innerRef}
					data-testid={`card-${index}`}
					id={`card-${index}`}
				>
					{quote.content}
				</div>
			)}
		</Draggable>
	);
}

function List({ items }: { items: ItemData[] }) {
	const { Droppable } = useDependency();

	const cards = useMemo(() => {
		return items.map((quote: ItemData, index: number) => (
			<Card quote={quote} index={index} key={quote.id} />
		));
	}, [items]);

	return (
		<Droppable droppableId="list">
			{(provided) => (
				<div ref={provided.innerRef} {...provided.droppableProps}>
					{cards}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	);
}

export function App() {
	const { DragDropContext } = useDependency();

	const [items, setItems] = useState(initialData);

	const onDragEnd = useCallback((result: DropResult) => {
		if (!result.destination) {
			return;
		}

		if (result.destination.index === result.source.index) {
			return;
		}

		const startIndex = result.source.index;
		const finishIndex = result.destination.index;

		setItems((items) => {
			return reorder({
				list: items,
				startIndex,
				finishIndex,
			});
		});
	}, []);

	const handleScrollToBottom = useCallback(() => {
		const bottomCard = document.getElementById('card-14');
		if (bottomCard) {
			bottomCard.scrollIntoView();
		}
	}, []);

	return (
		<>
			<div
				id="scroll-container"
				style={{
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					height: 400,
					/**
					 * Using `hidden` for `overflow-x` to avoid a horizontal scrollbar.
					 *
					 * When using `auto` one would appear initially, but would disappear
					 * after starting a drag. This caused a layout shift, and broke things.
					 */
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					overflow: 'hidden auto',
				}}
			>
				<DragDropContext onDragEnd={onDragEnd}>
					<List items={items} />
				</DragDropContext>
			</div>
			<Button onClick={handleScrollToBottom}>Scroll to bottom</Button>
		</>
	);
}

export default function VerticalListExample() {
	return (
		<ExampleWrapper>
			<App />
		</ExampleWrapper>
	);
}
