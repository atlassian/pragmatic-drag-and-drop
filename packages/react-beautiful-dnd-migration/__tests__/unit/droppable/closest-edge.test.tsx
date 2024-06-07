import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type { Direction, DropResult, OnDragEndResponder } from 'react-beautiful-dnd';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import { DragDropContext, Draggable, Droppable } from '../../../src';
import { setup } from '../_utils/setup';
import { mouse } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

function List({ direction, onDragEnd }: { direction: Direction; onDragEnd: OnDragEndResponder }) {
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="list" direction={direction}>
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps} data-testid="list">
						{['A', 'B', 'C'].map((id, index) => (
							<Draggable key={id} draggableId={`item-${id}`} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										data-testid={`item-${id}`}
										data-is-dragging={snapshot.isDragging}
									>
										Item {id}
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

describe('<Droppable /> closest edge behavior', () => {
	beforeAll(() => {
		setup();
	});

	beforeEach(() => {
		extractClosestEdge.mockReset();
	});

	const cases = [
		{
			closestEdge: 'top',
			description: 'should target the first index when entering from the top of a vertical list',
			destinationIndex: 0,
			direction: 'vertical',
		},
		{
			closestEdge: 'bottom',
			description: 'should target the last index when entering from the bottom of a vertical list',
			destinationIndex: 2,
			direction: 'vertical',
		},
		{
			closestEdge: 'left',
			description: 'should target the first index when entering from the left of a horizontal list',
			destinationIndex: 0,
			direction: 'horizontal',
		},
		{
			closestEdge: 'right',
			description: 'should target the last index when entering from the right of a horizontal list',
			destinationIndex: 2,
			direction: 'horizontal',
		},
	] as const;

	cases.forEach(({ closestEdge, description, destinationIndex, direction }) => {
		it(description, () => {
			const onDragEnd = jest.fn();
			const { getByTestId } = render(<List direction={direction} onDragEnd={onDragEnd} />);
			const itemB = getByTestId('item-B');

			mouse.lift(itemB);
			expect(isDragging(itemB)).toBe(true);

			/**
			 * Leave the list and re-enter it, mocking the closest edge value.
			 */
			const list = getByTestId('list');
			fireEvent.dragLeave(list);
			extractClosestEdge.mockReturnValue(closestEdge);
			fireEvent.dragEnter(list);

			mouse.drop(itemB);

			const dropResult: DropResult = {
				reason: 'DROP',
				source: {
					droppableId: 'list',
					index: 1,
				},
				destination: {
					droppableId: 'list',
					index: destinationIndex,
				},
				combine: null,
				mode: 'FLUID',
				draggableId: 'item-B',
				type: 'DEFAULT',
			};
			expect(onDragEnd).toHaveBeenCalledWith(dropResult, expect.any(Object));
		});
	});
});
