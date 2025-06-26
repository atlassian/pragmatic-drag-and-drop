import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type {
	DraggableProvided,
	DroppableStateSnapshot,
	DropResult,
	Responders,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../src';

import { getPlaceholder } from './_util';
import { setup } from './_utils/setup';
import {
	keyboard,
	mouse,
} from './ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

beforeAll(() => {
	setup();
});

function noop() {}

type Item = { id: string };

const itemData: Item[] = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];

/**
 * This is not a real virtual renderer.
 *
 * It is intended to emulate the behavior of the JSW board, which unmounts a
 * `<Draggable>` when it is being dragged.
 */
function FakeVirtualRenderer({
	itemData,
	snapshot,
}: {
	itemData: Item[];
	snapshot: DroppableStateSnapshot;
}) {
	return (
		<>
			{itemData.map((item, index) => {
				/**
				 * If the item is being dragged then don't render it
				 */
				if (item.id === snapshot.draggingFromThisWith) {
					return null;
				}

				return (
					<Draggable key={item.id} draggableId={item.id} index={index}>
						{(provided) => <DraggableContent provided={provided} item={item} />}
					</Draggable>
				);
			})}
		</>
	);
}

function DraggableContent({ provided, item }: { provided: DraggableProvided; item: Item }) {
	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			data-testid={`item-${item.id}`}
		>
			{item.id}
		</div>
	);
}

/**
 * This list does not use real virtualization. It is only being used to test
 * virtual list support.
 *
 * See the comment for `FakeVirtualRenderer` for more information.
 */
function VirtualList({
	responders,
	itemData,
}: {
	responders: Partial<Responders>;
	itemData: Item[];
}) {
	return (
		<DragDropContext onDragEnd={noop} {...responders}>
			<Droppable
				droppableId="droppable"
				mode="virtual"
				renderClone={(provided, _, rubric) => {
					const { index } = rubric.source;
					const item = itemData[index];
					return <DraggableContent provided={provided} item={item} />;
				}}
			>
				{(provided, snapshot) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						<FakeVirtualRenderer itemData={itemData} snapshot={snapshot} />
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

function getResponders() {
	return {
		onDragStart: jest.fn(),
		onDragUpdate: jest.fn(),
		onDragEnd: jest.fn(),
	};
}

describe('when a <Draggable /> in a virtual list is unmounted on drag', () => {
	describe('keyboard dragging', () => {
		it('should capture and report a11y violations', async () => {
			const responders = getResponders();
			const { container } = render(<VirtualList responders={responders} itemData={itemData} />);

			await expect(container).toBeAccessible();
		});

		it('should have a placeholder', () => {
			const responders = getResponders();
			const { getByTestId } = render(<VirtualList responders={responders} itemData={itemData} />);

			keyboard.lift(getByTestId('item-A'));

			expect(() => getPlaceholder()).not.toThrow();
		});

		it('should not move when dragged away and then dropped on the home position', () => {
			const responders = getResponders();
			const { getByTestId } = render(<VirtualList responders={responders} itemData={itemData} />);

			keyboard.lift(getByTestId('item-A'));
			fireEvent.keyDown(window, { key: 'ArrowDown' });
			fireEvent.keyDown(window, { key: 'ArrowUp' });
			keyboard.drop(getByTestId('item-A'));

			const expectedDropResult: DropResult = {
				reason: 'DROP',
				source: { droppableId: 'droppable', index: 0 },
				destination: { droppableId: 'droppable', index: 0 },
				combine: null,
				mode: 'SNAP',
				draggableId: 'A',
				type: 'DEFAULT',
			};
			expect(responders.onDragEnd).toHaveBeenCalledWith(expectedDropResult, expect.any(Object));
		});
	});

	describe('pointer dragging', () => {
		it('should have a placeholder', () => {
			const responders = getResponders();
			const { getByTestId } = render(<VirtualList responders={responders} itemData={itemData} />);

			mouse.lift(getByTestId('item-A'));

			expect(() => getPlaceholder()).not.toThrow();
		});

		it('should not move when dragged away and then dropped on the home position', () => {
			const responders = getResponders();

			const { getByTestId } = render(<VirtualList responders={responders} itemData={itemData} />);

			mouse.lift(getByTestId('item-A'));
			fireEvent.dragOver(getByTestId('item-C'));
			fireEvent.dragOver(getPlaceholder());
			mouse.drop(getByTestId('item-A'));

			const expectedDropResult: DropResult = {
				reason: 'DROP',
				source: { droppableId: 'droppable', index: 0 },
				destination: { droppableId: 'droppable', index: 0 },
				combine: null,
				mode: 'FLUID',
				draggableId: 'A',
				type: 'DEFAULT',
			};
			expect(responders.onDragEnd).toHaveBeenCalledWith(expectedDropResult, expect.any(Object));
		});
	});
});
