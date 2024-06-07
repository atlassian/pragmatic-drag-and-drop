// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/on-before-capture/removals.spec.js>

import React, { useState } from 'react';

import { render } from '@testing-library/react';
import type { DragStart } from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

const noop = () => {};

function getIndex(el: HTMLElement): number {
	return Number(el.getAttribute('data-index'));
}

it('should adjust captured values for any changes that impact that dragging item', () => {
	jest.useFakeTimers();
	// 1. Changing the `type` of the Droppable
	// 2. Adding and item before the dragging item to impact it's index
	const onDragStart = jest.fn();

	function Root() {
		const [items, setItems] = useState(['first', 'second']);
		function onBeforeCapture() {
			// removing the first item
			setItems(['second']);
		}

		return (
			<DragDropContext onDragEnd={noop} onBeforeCapture={onBeforeCapture} onDragStart={onDragStart}>
				<Droppable droppableId="droppable">
					{(droppableProvided) => (
						<div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
							{items.map((item: string, index: number) => (
								<Draggable draggableId={item} index={index} key={item}>
									{(provided, snapshot) => (
										<div
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											data-index={index}
											data-testid={item}
											data-is-dragging={snapshot.isDragging}
											ref={provided.innerRef}
										>
											Drag me!
										</div>
									)}
								</Draggable>
							))}
							{droppableProvided.placeholder};
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}

	const { getByTestId, queryByTestId } = render(<Root />);
	const second: HTMLElement = getByTestId('second');

	// initially it had an index of 1
	expect(getIndex(second)).toBe(1);

	setElementFromPoint(getByTestId('second'));
	mouse.lift(getByTestId('second'));

	// first item has been removed
	expect(queryByTestId('first')).toBe(null);
	// second is now dragging
	expect(isDragging(second)).toBe(true);
	// second index accounts for removal
	expect(getIndex(second)).toBe(0);

	// flush onDragStart timer
	jest.runOnlyPendingTimers();

	// onDragStart called with correct new index
	const expected: DragStart = {
		draggableId: 'second',
		mode: 'FLUID',
		type: 'DEFAULT',
		source: {
			index: 0,
			droppableId: 'droppable',
		},
	};
	expect(onDragStart.mock.calls[0][0]).toEqual(expected);

	jest.useRealTimers();
});
