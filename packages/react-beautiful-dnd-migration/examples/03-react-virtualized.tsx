/** @jsx jsx */

import { useCallback, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import type { DropResult } from 'react-beautiful-dnd';

import { getInitialData, moveCard, reorderCard, reorderColumn } from './data/tasks';
import { ExampleWrapper, useDependency } from './pieces/example-wrapper';
import { Column } from './pieces/react-virtualized/column';

const boardStyles = css({
	display: 'flex',
	justifyContent: 'center',
	flexDirection: 'row',
	height: 480,
});

function BoardExample() {
	const { DragDropContext, Droppable } = useDependency();

	const [data, setData] = useState(() => getInitialData());

	const onDragEnd = useCallback((result: DropResult) => {
		const { source, destination, type } = result;

		// didn't drop on anything
		if (!destination) {
			return;
		}

		if (type === 'column') {
			setData((data) => reorderColumn(data, result));
			return;
		}

		if (type === 'card') {
			if (source.droppableId === destination.droppableId) {
				// same column
				setData((data) => reorderCard(data, result));
				return;
			}

			// moving to a new column
			setData((data) => moveCard(data, result));
		}
	}, []);

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="board" type="column" direction="horizontal">
				{(provided) => {
					return (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							data-testid="board"
							css={boardStyles}
						>
							{data.orderedColumnIds.map((columnId, index) => {
								return (
									<Column
										index={index}
										droppableId={columnId}
										column={data.columnMap[columnId]}
										key={columnId}
									/>
								);
							})}
							{provided.placeholder}
						</div>
					);
				}}
			</Droppable>
		</DragDropContext>
	);
}

export default function () {
	return (
		<ExampleWrapper>
			<BoardExample />
		</ExampleWrapper>
	);
}
