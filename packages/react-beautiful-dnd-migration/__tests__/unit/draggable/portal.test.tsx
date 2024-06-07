// This file extends the portal test(s) from `react-beautiful-dnd`

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type {
	DraggableProvided,
	DraggableStateSnapshot,
	DragStart,
	DragUpdate,
	DropResult,
} from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import { setElementFromPoint } from '../_util';
import App, { type Item } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/app';
import {
	mouse,
	simpleLift,
} from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

afterAll(() => {
	document.body.removeChild(portal);
});

const renderItem =
	(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
		const child = (
			<div
				ref={provided.innerRef}
				{...provided.draggableProps}
				{...provided.dragHandleProps}
				data-testid={item.id}
				data-is-dragging={snapshot.isDragging}
				data-dragging-over={snapshot.draggingOver}
			>
				Drag me!
			</div>
		);

		if (!snapshot.isDragging) {
			return child;
		}

		return ReactDOM.createPortal(child, portal);
	};

it('should allow consumers to use their own portal', () => {
	const { getByTestId } = render(<App renderItem={renderItem} />);

	const before: HTMLElement = getByTestId('0');
	setElementFromPoint(before);
	simpleLift(mouse, before);

	// moved to portal after lift
	const inPortal: HTMLElement = getByTestId('0');
	expect(inPortal).toHaveAttribute('data-dragging-over', 'droppable');

	fireEvent.dragLeave(getByTestId('droppable'));
	expect(inPortal).not.toHaveAttribute('data-dragging-over');

	// out of portal after drop
	mouse.drop(inPortal);
});

it('should fire expected events', () => {
	jest.useFakeTimers();

	const onDragStart = jest.fn();
	const onDragUpdate = jest.fn();
	const onDragEnd = jest.fn();

	const { getByTestId } = render(
		<App
			renderItem={renderItem}
			onDragStart={onDragStart}
			onDragUpdate={onDragUpdate}
			onDragEnd={onDragEnd}
		/>,
	);

	const before: HTMLElement = getByTestId('0');
	setElementFromPoint(before);
	simpleLift(mouse, before);
	jest.runOnlyPendingTimers();

	const dragStart: DragStart = {
		mode: 'FLUID',
		type: 'DEFAULT',
		draggableId: '0',
		source: {
			droppableId: 'droppable',
			index: 0,
		},
	};
	expect(onDragStart).toHaveBeenCalledWith(dragStart, expect.any(Object));

	// moved to portal after lift
	const inPortal: HTMLElement = getByTestId('0');
	expect(inPortal).toHaveAttribute('data-dragging-over', 'droppable');

	extractClosestEdge.mockReturnValue('bottom');
	fireEvent.dragEnter(getByTestId('2'));
	jest.runOnlyPendingTimers();
	const dragUpdate: DragUpdate = {
		...dragStart,
		combine: null,
		destination: {
			droppableId: 'droppable',
			index: 2,
		},
	};
	expect(onDragUpdate).toHaveBeenCalledWith(dragUpdate, expect.any(Object));

	mouse.drop(inPortal);
	const result: DropResult = {
		...dragUpdate,
		reason: 'DROP',
	};
	expect(onDragEnd).toHaveBeenCalledWith(result);

	expect(inPortal).not.toBeInTheDocument();

	jest.useRealTimers();
});
