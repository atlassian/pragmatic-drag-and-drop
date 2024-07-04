import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { replaceRaf } from 'raf-stub';

import { autoScroller } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll';

import { DragDropContext, Draggable, Droppable } from '../../../src';
import { setElementFromPoint } from '../_util';
import { mouse } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

function List() {
	return (
		<DragDropContext onDragEnd={() => {}}>
			<Droppable droppableId="list">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps} data-testid="list">
						<Draggable draggableId="item" index={0}>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									data-testid="item"
									data-is-dragging={snapshot.isDragging}
								>
									Item
								</div>
							)}
						</Draggable>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

const autoScrollerStart = jest.spyOn(autoScroller, 'start');
const autoScrollerUpdateInput = jest.spyOn(autoScroller, 'updateInput');
const autoScrollerStop = jest.spyOn(autoScroller, 'stop');

replaceRaf();

describe('integration with @atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll', () => {
	it('should call autoScroller.start() on dragstart', () => {
		const { getByTestId } = render(<List />);
		const item = getByTestId('item');

		setElementFromPoint(item);
		fireEvent.dragStart(item, { clientX: 1, clientY: 2 });
		act(() => {
			// @ts-expect-error
			requestAnimationFrame.step();
		});

		expect(isDragging(item)).toBe(true);
		expect(autoScrollerStart).toHaveBeenCalledWith({
			input: expect.objectContaining({ clientX: 1, clientY: 2 }),
		});

		mouse.cancel(item);
	});

	it('should call autoScroller.updateInput() on drag', () => {
		const { getByTestId } = render(<List />);
		const item = getByTestId('item');

		setElementFromPoint(item);
		fireEvent.dragStart(item, { clientX: 1, clientY: 2 });

		fireEvent.dragOver(item, { clientX: 3, clientY: 4 });
		act(() => {
			// @ts-expect-error
			requestAnimationFrame.step();
		});
		expect(autoScrollerUpdateInput).toHaveBeenCalledWith({
			input: expect.objectContaining({ clientX: 3, clientY: 4 }),
		});

		fireEvent.dragOver(item, { clientX: 5, clientY: 6 });
		act(() => {
			// @ts-expect-error
			requestAnimationFrame.step();
		});
		expect(autoScrollerUpdateInput).toHaveBeenCalledWith({
			input: expect.objectContaining({ clientX: 5, clientY: 6 }),
		});

		mouse.cancel(item);
	});

	it('should call autoScroller.stop() on drop', () => {
		const { getByTestId } = render(<List />);
		const item = getByTestId('item');

		setElementFromPoint(item);
		fireEvent.dragStart(item);
		fireEvent.dragEnd(item);

		expect(autoScrollerStop).toHaveBeenCalled();
	});
});
