import React, { type ReactNode } from 'react';

import { render } from '@testing-library/react';

import { skipAutoA11yFile } from '@atlassian/a11y-jest-testing';

import { DragDropContext, Draggable, Droppable, resetServerContext } from '../../../src';
import { findDragHandle } from '../../../src/utils/find-drag-handle';

// This file exposes one or more accessibility violations. Testing is currently skipped but violations need to
// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
// the next line and associated import. For more information, see go/afm-a11y-tooling:jest
skipAutoA11yFile();

function App({ children }: { children: ReactNode }) {
	return (
		<DragDropContext onDragEnd={() => {}}>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{children}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

describe('findDragHandle()', () => {
	afterEach(() => {
		resetServerContext();
	});

	it('should capture and report a11y violations', async () => {
		const draggableId = 'draggable';
		const { container } = render(
			<App>
				<Draggable draggableId={draggableId} index={0}>
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							data-testid="draggable"
						>
							Draggable element
						</div>
					)}
				</Draggable>
			</App>,
		);

		await expect(container).toBeAccessible();
	});

	it('should return the element if it is also the drag handle', () => {
		const draggableId = 'draggable';

		const { getByTestId } = render(
			<App>
				<Draggable draggableId={draggableId} index={0}>
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							data-testid="draggable"
						/>
					)}
				</Draggable>
			</App>,
		);

		const draggableElement = getByTestId('draggable');

		expect(findDragHandle({ contextId: '0', draggableId })).toBe(draggableElement);
	});

	it('should find the descendant element otherwise', () => {
		const draggableId = 'draggable';

		const { getByTestId } = render(
			<App>
				<Draggable draggableId={draggableId} index={0}>
					{(provided) => (
						<div ref={provided.innerRef} {...provided.draggableProps} data-testid="draggable">
							<div {...provided.dragHandleProps} data-testid="drag-handle" />
						</div>
					)}
				</Draggable>
			</App>,
		);

		const dragHandleElement = getByTestId('drag-handle');

		expect(findDragHandle({ contextId: '0', draggableId })).toBe(dragHandleElement);
	});
});
