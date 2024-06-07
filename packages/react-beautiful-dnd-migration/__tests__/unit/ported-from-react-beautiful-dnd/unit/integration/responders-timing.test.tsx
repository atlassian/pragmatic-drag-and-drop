// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/responders-timing.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type { DraggableProvided, DroppableProvided, Responders } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { DragDropContext, Draggable, Droppable } from '../../../../../src';
import { setElementFromPoint } from '../../../_util';

import { keyboard, mouse } from './_utils/controls';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

type ItemProps = {
	provided: DraggableProvided;
	onRender: Function;
};

const Item = ({ onRender, provided }: ItemProps) => {
	onRender();

	return (
		<div
			data-testid="drag-handle"
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
		>
			<h4>Draggable</h4>
		</div>
	);
};

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	jest.useRealTimers();
});

const cases = [
	{ id: 'mouse', control: mouse },
	{ id: 'keyboard', control: keyboard },
] as const;

cases.forEach(({ id, control }) => {
	it(`should call the onBeforeDragStart before connected components are updated, and onDragStart after (${id})`, () => {
		let onBeforeDragStartTime: DOMHighResTimeStamp | null = null;
		let onDragStartTime: DOMHighResTimeStamp | null = null;
		let renderTime: DOMHighResTimeStamp | null = null;
		const responders: Responders = {
			onBeforeDragStart: jest.fn().mockImplementation(() => {
				invariant(!onBeforeDragStartTime, 'onBeforeDragStartTime already set');
				onBeforeDragStartTime = performance.now();
			}),
			onDragStart: jest.fn().mockImplementation(() => {
				invariant(!onDragStartTime, 'onDragStartTime already set');
				onDragStartTime = performance.now();
			}),
			onDragEnd: jest.fn(),
		};
		const onItemRender = jest.fn().mockImplementation(() => {
			invariant(!renderTime, 'renderTime already set');
			renderTime = performance.now();
		});

		const { getByTestId, unmount } = render(
			<DragDropContext {...responders}>
				<Droppable droppableId="droppable">
					{(droppableProvided: DroppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							<h2>Droppable</h2>
							<Draggable draggableId="draggable" index={0}>
								{(draggableProvided: DraggableProvided) => (
									<Item onRender={onItemRender} provided={draggableProvided} />
								)}
							</Draggable>
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>,
		);

		// clearing the initial render before a drag
		expect(onItemRender).toHaveBeenCalledTimes(1);
		renderTime = null;
		onItemRender.mockClear();

		// start a drag
		const handle: HTMLElement = getByTestId('drag-handle');

		setElementFromPoint(handle);
		control.lift(handle);
		// flushing onDragStart
		jest.runOnlyPendingTimers();

		// checking values are set
		invariant(onBeforeDragStartTime, 'onBeforeDragStartTime should be set');
		invariant(onDragStartTime, 'onDragStartTime should be set');
		invariant(renderTime, 'renderTime should be set');

		// expected order
		// 1. onBeforeDragStart
		// 2. item render
		// 3. onDragStart
		expect(onBeforeDragStartTime).toBeLessThan(renderTime);
		expect(renderTime).toBeLessThan(onDragStartTime);

		// validation
		expect(responders.onBeforeDragStart).toHaveBeenCalledTimes(1);
		expect(responders.onDragStart).toHaveBeenCalledTimes(1);
		expect(onItemRender).toHaveBeenCalledTimes(1);
		unmount();
	});
});
