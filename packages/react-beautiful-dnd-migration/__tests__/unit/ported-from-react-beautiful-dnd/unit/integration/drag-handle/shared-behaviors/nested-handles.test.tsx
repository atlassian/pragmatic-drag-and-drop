import React from 'react';

import { render } from '@testing-library/react';

import { skipAutoA11yFile } from '@atlassian/a11y-jest-testing';

import { DragDropContext, Draggable, Droppable } from '../../../../../../../src';
import { setup } from '../../../../../_utils/setup';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

// This file exposes one or more accessibility violations. Testing is currently skipped but violations need to
// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
// the next line and associated import. For more information, see go/afm-a11y-tooling:jest
skipAutoA11yFile();

beforeAll(() => {
	setup();
});

function Board() {
	return (
		<DragDropContext onDragEnd={() => {}}>
			<Droppable droppableId="board" type="column">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						<Draggable draggableId="column--draggable" index={0}>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									data-testid="column"
									data-is-dragging={snapshot.isDragging}
								>
									<Droppable droppableId="column--draggable">
										{(provided) => (
											<div ref={provided.innerRef} {...provided.droppableProps}>
												<Draggable draggableId="card" index={0}>
													{(provided, snapshot) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															data-is-over={snapshot.draggingOver}
															data-is-dragging={snapshot.isDragging}
															data-testid="card"
														>
															Card
														</div>
													)}
												</Draggable>

												{provided.placeholder}
											</div>
										)}
									</Droppable>
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

forEachSensor((control: Control) => {
	it('should not start a drag on a parent if a child drag handle has already received the event', () => {
		const { getByTestId } = render(<Board />);
		const cardHandle: HTMLElement = getByTestId('card');
		const columnHandle: HTMLElement = getByTestId('column');

		simpleLift(control, cardHandle);

		expect(isDragging(cardHandle)).toBe(true);
		expect(isDragging(columnHandle)).toBe(false);
	});
	it('should start a drag on a parent the event is trigged on the parent', () => {
		const { getByTestId } = render(<Board />);
		const cardHandle: HTMLElement = getByTestId('card');
		const columnHandle: HTMLElement = getByTestId('column');

		simpleLift(control, columnHandle);

		expect(isDragging(columnHandle)).toBe(true);
		expect(isDragging(cardHandle)).toBe(false);
	});
});
