// The tests in this file are derived from the placeholder tests in `react-beautiful-dnd`
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/droppable/placeholder.spec.js>
//
// Placeholders in the migration layer are rendered by the `<Draggable>` but
// have some similar behavior.

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import invariant from 'tiny-invariant';

import { DragDropContext, Draggable, Droppable } from '../../../src';
import { getDroppable, hasPlaceholderInDroppable, setElementFromPoint } from '../_util';
import { mouse } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

const columns = [
	{ id: 'A', items: [{ id: 'A0' }, { id: 'A1' }, { id: 'A2' }] },
	{ id: 'B', items: [{ id: 'B0' }] },
	{ id: 'C', items: [] },
];

function Board() {
	return (
		<DragDropContext onDragEnd={() => {}}>
			<Droppable droppableId="board" type="column">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						{columns.map((column, index) => (
							<Draggable key={column.id} draggableId={`column-${column.id}`} index={index}>
								{(provided) => (
									<div ref={provided.innerRef} {...provided.draggableProps}>
										<div {...provided.dragHandleProps}>Column {column.id}</div>
										<Droppable droppableId={column.id}>
											{(provided) => (
												<div ref={provided.innerRef} {...provided.droppableProps}>
													{column.items.map((item, index) => (
														<Draggable key={item.id} draggableId={item.id} index={index}>
															{(provided, snapshot) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	data-is-over={snapshot.draggingOver}
																	data-is-dragging={snapshot.isDragging}
																>
																	Item {item.id}
																</div>
															)}
														</Draggable>
													))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
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

function getAllColumnDroppableIds() {
	const droppableIds = columns.map((column) => column.id);
	invariant(droppableIds.length > 0, 'There are some droppable ids');
	return droppableIds;
}

function isOver(element: HTMLElement) {
	return element.getAttribute('data-is-over');
}

it('should not render a placeholder at rest', () => {
	const { container } = render(<Board />);

	const droppableIds = getAllColumnDroppableIds();
	droppableIds.forEach((droppableId) => {
		expect(hasPlaceholderInDroppable(droppableId, container)).toBe(false);
	});
});

/**
 * In `react-beautiful-dnd` this was testing 'when dragging over' instead.
 */
it('should render a placeholder when dragging from', () => {
	const { container, getByText } = render(<Board />);

	const handle = getByText('Item B0');
	setElementFromPoint(handle);
	mouse.lift(handle);

	expect(isOver(handle)).toBe('B');
	expect(hasPlaceholderInDroppable('B', container)).toBe(true);

	fireEvent.dragLeave(getDroppable('B', container));

	expect(isOver(handle)).toBe(null);
	expect(hasPlaceholderInDroppable('B', container)).toBe(true);
});

it('should remove all placeholders if an error occurs while dragging', () => {
	const droppableIds = getAllColumnDroppableIds();
	droppableIds.forEach((droppableId) => {
		const { container, getByText, unmount } = render(<Board />);

		const handle = getByText('Item A0');
		setElementFromPoint(handle);
		mouse.lift(handle);

		fireEvent.dragEnter(getDroppable(droppableId, container));

		expect(isDragging(handle)).toBe(true);
		expect(isOver(handle)).toBe(droppableId);
		expect(hasPlaceholderInDroppable('A', container)).toBe(true);

		fireEvent(window, new Event('error'));

		expect(isDragging(handle)).toBe(false);
		expect(hasPlaceholderInDroppable('A', container)).toBe(false);

		unmount();
	});
});

describe('home list', () => {
	it('should capture and report a11y violations', async () => {
		const { container } = render(<Board />);

		await expect(container).toBeAccessible();
	});

	it('should always render a placeholder while dragging', () => {
		const droppableIds = getAllColumnDroppableIds();
		droppableIds.forEach((droppableId) => {
			const { container, getByText, unmount } = render(<Board />);

			const handle = getByText('Item A0');
			setElementFromPoint(handle);
			mouse.lift(handle);

			fireEvent.dragEnter(getDroppable(droppableId, container));

			// regardless of what we are over
			// there should always be a placeholder in home
			expect(isOver(handle)).toBe(droppableId);
			expect(hasPlaceholderInDroppable('A', container)).toBe(true);

			unmount();
		});
	});

	it('should immediately remove the home placeholder after dropping into any list', () => {
		const droppableIds = getAllColumnDroppableIds();

		droppableIds.forEach((droppableId) => {
			const { container, getByText, unmount } = render(<Board />);

			const handle: HTMLElement = getByText('Item A0');
			setElementFromPoint(handle);
			mouse.lift(handle);

			fireEvent.dragEnter(getDroppable(droppableId, container));
			expect(isOver(handle)).toBe(droppableId);

			fireEvent.drop(handle);
			// placeholder removed straight after drop
			expect(hasPlaceholderInDroppable(droppableId, container)).toBe(false);

			unmount();
		});
	});

	it('should immediately remove the home placeholder after dropping nowhere', () => {
		const { container, getByText } = render(<Board />);

		const handle: HTMLElement = getByText('Item A0');
		setElementFromPoint(handle);
		mouse.lift(handle);

		fireEvent.dragEnter(getDroppable('A', container));
		fireEvent.dragLeave(getDroppable('A', container));
		expect(isOver(handle)).toBe(null);

		// placeholder present when over nothing
		expect(hasPlaceholderInDroppable('A', container)).toBe(true);

		// placeholder gone after drop finished
		fireEvent.drop(handle);
		expect(hasPlaceholderInDroppable('A', container)).toBe(false);
	});
});

describe('foreign list', () => {
	it('should not render a placeholder if not dragging over', () => {
		const droppableIds = getAllColumnDroppableIds();
		droppableIds
			.filter((droppableId) => droppableId !== 'A')
			.forEach((droppableId) => {
				const { container, getByText, unmount } = render(<Board />);

				const handle = getByText('Item A0');
				setElementFromPoint(handle);
				mouse.lift(handle);

				expect(isOver(handle)).not.toBe(droppableId);
				expect(hasPlaceholderInDroppable(droppableId, container)).toBe(false);

				unmount();
			});
	});

	it('should not render a placeholder if dragging over', () => {
		const droppableIds = getAllColumnDroppableIds();
		droppableIds
			.filter((droppableId) => droppableId !== 'A')
			.forEach((droppableId) => {
				const { container, getByText, unmount } = render(<Board />);

				const handle = getByText('Item A0');
				setElementFromPoint(handle);
				mouse.lift(handle);

				fireEvent.dragEnter(getDroppable(droppableId, container));
				expect(isOver(handle)).toBe(droppableId);
				expect(hasPlaceholderInDroppable(droppableId, container)).toBe(false);

				unmount();
			});
	});
});
