import React, { useCallback, useState } from 'react';

import {
	DragDropContext,
	Draggable,
	Droppable,
	type OnDragEndResponder,
} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { initialData } from '../data';
import { Subtask, type SubtaskProps } from '../primitives/subtask';
import { SubtaskContainer } from '../primitives/subtask-container';

type DraggableSubtaskProps = SubtaskProps & {
	index: number;
};

function DraggableSubtask({ index, ...subtaskProps }: DraggableSubtaskProps) {
	/**
	 * Using unique id's to avoid collisions with rbd items on the page.
	 * If there are collisions then rbd will try to control the items.
	 */
	const draggableId = `migration-layer--${subtaskProps.id}`;
	return (
		<Draggable draggableId={draggableId} index={index}>
			{(provided, snapshot) => (
				<Subtask
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					{...subtaskProps}
					appearance={snapshot.isDragging ? 'overlay' : 'default'}
				/>
			)}
		</Draggable>
	);
}

export default function SubtasksMigrationLayer(): React.JSX.Element {
	const [data, setData] = useState(initialData);

	const onDragEnd: OnDragEndResponder = useCallback(({ source, destination }) => {
		if (!destination) {
			return;
		}

		const startIndex = source.index;
		const finishIndex = destination.index;

		setData((data) =>
			reorder({
				list: data,
				startIndex,
				finishIndex,
			}),
		);
	}, []);

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="migration-layer--droppable">
				{(provided) => (
					<SubtaskContainer ref={provided.innerRef} {...provided.droppableProps}>
						{data.map((item, index) => (
							<DraggableSubtask
								key={item.id}
								id={item.id}
								title={item.title}
								index={index}
								isLastItem={index === data.length - 1}
							/>
						))}
						{provided.placeholder}
					</SubtaskContainer>
				)}
			</Droppable>
		</DragDropContext>
	);
}
