// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/state/middleware/responders/abort.spec.js>

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type { DragDropContextProps, DropResult } from 'react-beautiful-dnd';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import { DragDropContext, Draggable, Droppable } from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../../integration/_utils/controls';

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

function App(props: Partial<DragDropContextProps>) {
	return (
		<DragDropContext onDragEnd={() => {}} {...props}>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						<Draggable draggableId="draggable-0" index={0}>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
								>
									first
								</div>
							)}
						</Draggable>
						<Draggable draggableId="draggable-1" index={1}>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
								>
									second
								</div>
							)}
						</Draggable>
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

jest.useFakeTimers();

it('should call onDragEnd with the last published critical descriptor', () => {
	const onDragStart = jest.fn();
	const onDragEnd = jest.fn();

	const { getByText } = render(<App onDragStart={onDragStart} onDragEnd={onDragEnd} />);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);

	jest.runOnlyPendingTimers();
	expect(onDragStart).toHaveBeenCalledTimes(1);

	mouse.cancel(draggable);

	const expected: DropResult = {
		type: 'DEFAULT',
		mode: 'FLUID',
		draggableId: 'draggable-0',
		source: {
			droppableId: 'droppable',
			index: 0,
		},
		destination: null,
		combine: null,
		reason: 'CANCEL',
	};
	expect(onDragEnd).toHaveBeenCalledWith(expected, expect.any(Object));
});

it('should publish an onDragEnd with no destination even if there is a current destination', () => {
	const onDragStart = jest.fn();
	const onDragUpdate = jest.fn();
	const onDragEnd = jest.fn();

	const { getByText } = render(
		<App onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd} />,
	);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);

	jest.runOnlyPendingTimers();
	expect(onDragStart).toHaveBeenCalledTimes(1);

	extractClosestEdge.mockReturnValue('bottom');
	fireEvent.dragOver(getByText('second'));
	jest.runOnlyPendingTimers();
	expect(onDragUpdate).toHaveBeenCalledWith(
		expect.objectContaining({
			destination: {
				droppableId: 'droppable',
				index: 1,
			},
		}),
		expect.any(Object),
	);

	mouse.cancel(draggable);
	const expected: DropResult = {
		type: 'DEFAULT',
		mode: 'FLUID',
		draggableId: 'draggable-0',
		source: {
			droppableId: 'droppable',
			index: 0,
		},
		destination: null,
		combine: null,
		reason: 'CANCEL',
	};
	expect(onDragEnd).toHaveBeenCalledWith(expected, expect.any(Object));
});

it('should not publish an onDragEnd if aborted after a drop', () => {
	const onDragStart = jest.fn();
	const onDragUpdate = jest.fn();
	const onDragEnd = jest.fn();

	const { getByText } = render(
		<App onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd} />,
	);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);

	jest.runOnlyPendingTimers();
	expect(onDragStart).toHaveBeenCalledTimes(1);

	mouse.cancel(draggable);
	expect(onDragEnd).toHaveBeenCalledTimes(1);

	onDragEnd.mockReset();

	mouse.cancel(draggable);
	expect(onDragEnd).not.toHaveBeenCalled();
});

it('should publish an onDragEnd if aborted before the publish of an onDragStart', () => {
	const onDragEnd = jest.fn();
	const onDragStart = jest.fn();

	const { getByText } = render(<App onDragEnd={onDragEnd} onDragStart={onDragStart} />);

	const firstItem = getByText('first');

	setElementFromPoint(firstItem);
	mouse.lift(firstItem);

	expect(onDragStart).not.toHaveBeenCalled();

	fireEvent.dragEnd(firstItem);

	expect(onDragStart).toHaveBeenCalled();
	expect(onDragEnd).toHaveBeenCalled();
});
