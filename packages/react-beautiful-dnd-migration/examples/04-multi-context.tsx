/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { ExampleWrapper, useDependency } from './pieces/example-wrapper';

const itemData = [{ id: '0' }, { id: '1' }, { id: '2' }];

function VerticalList() {
	const { DragDropContext, Draggable, Droppable } = useDependency();

	return (
		<DragDropContext
			onDragStart={(start) => console.log(start)}
			onDragUpdate={(update) => console.log(update)}
			onDragEnd={(result) => console.log(result)}
		>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{itemData.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
									>
										{item.id}
									</div>
								)}
							</Draggable>
						))}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

const layoutStyles = css({ display: 'flex', gap: 48 });

export default function MultiContextExample() {
	return (
		<ExampleWrapper>
			<div css={layoutStyles}>
				<VerticalList />
				<VerticalList />
			</div>
		</ExampleWrapper>
	);
}
