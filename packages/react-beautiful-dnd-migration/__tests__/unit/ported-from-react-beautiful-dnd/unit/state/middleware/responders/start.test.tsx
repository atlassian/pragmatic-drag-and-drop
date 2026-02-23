// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/state/middleware/responders/start.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type { DragDropContextProps, DragStart } from 'react-beautiful-dnd';

import { skipAutoA11yFile } from '@atlassian/a11y-jest-testing';

import { DragDropContext, Draggable, Droppable } from '../../../../../../../src';
import { setElementFromPoint } from '../../../../../_util';
import { mouse } from '../../../integration/_utils/controls';
import { isDragging } from '../../../integration/_utils/helpers';

// This file exposes one or more accessibility violations. Testing is currently skipped but violations need to
// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
// the next line and associated import. For more information, see go/afm-a11y-tooling:jest
skipAutoA11yFile();

function App(props: Partial<DragDropContextProps>) {
	return (
		<DragDropContext onDragEnd={() => {}} {...props}>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						<Draggable draggableId="draggable-0" index={0}>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									data-is-dragging={snapshot.isDragging}
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

const expectedDragStart: DragStart = {
	mode: 'FLUID',
	type: 'DEFAULT',
	draggableId: 'draggable-0',
	source: {
		droppableId: 'droppable',
		index: 0,
	},
};

jest.useFakeTimers();

afterEach(() => {
	mouse.cancel(document.body);
});

it('should call the onDragStart responder when a initial publish occurs', () => {
	const onDragStart = jest.fn();

	const { getByText } = render(<App onDragStart={onDragStart} />);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);

	expect(onDragStart).not.toHaveBeenCalled();

	jest.runOnlyPendingTimers();

	expect(onDragStart).toHaveBeenCalledWith(expectedDragStart, expect.any(Object));
});

it('should call the onBeforeDragStart and onDragStart in the correct order', () => {
	const onBeforeDragStart = jest.fn();
	const onDragStart = jest.fn();

	const { getByText } = render(
		<App onBeforeDragStart={onBeforeDragStart} onDragStart={onDragStart} />,
	);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);

	expect(onBeforeDragStart).toHaveBeenCalledWith(expectedDragStart);
	expect(onDragStart).not.toHaveBeenCalled();

	jest.runOnlyPendingTimers();
	expect(onBeforeDragStart).toHaveBeenCalledTimes(1);
	expect(onDragStart).toHaveBeenCalledTimes(1);
});

// original test was to throw an exception, not ignore
// but this would be handled by @atlaskit/pragmatic-drag-and-drop and not something we'd know about
it('should not call onDragStart if a dragStart event occurs before a drag ends', () => {
	const onDragStart = jest.fn();

	const { getByText } = render(<App onDragStart={onDragStart} />);

	const draggable = getByText('first');

	setElementFromPoint(draggable);
	mouse.lift(draggable);
	expect(isDragging(draggable)).toBe(true);

	jest.runOnlyPendingTimers();
	expect(onDragStart).toHaveBeenCalled();

	onDragStart.mockReset();
	mouse.lift(getByText('second'));
	jest.runOnlyPendingTimers();
	expect(isDragging(draggable)).toBe(true);
	expect(isDragging(getByText('second'))).toBe(false);
	expect(onDragStart).not.toHaveBeenCalled();
});
