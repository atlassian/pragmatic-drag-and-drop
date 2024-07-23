/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { useCallback, useMemo, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import type { DropResult } from 'react-beautiful-dnd';

import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { token } from '@atlaskit/tokens';

import { ExampleWrapper, useDependency } from './pieces/example-wrapper';

type ItemData = {
	id: string;
	content: string;
};

const initialData: ItemData[] = Array.from({ length: 10 }, (_, index) => {
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

function App() {
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

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<List items={items} />
		</DragDropContext>
	);
}

export default function VerticalListExample() {
	return (
		<ExampleWrapper>
			<App />
		</ExampleWrapper>
	);
}
