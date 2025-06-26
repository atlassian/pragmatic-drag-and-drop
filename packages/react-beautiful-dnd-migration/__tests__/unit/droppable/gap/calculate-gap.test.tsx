import React from 'react';

import { render } from '@testing-library/react';
import type { Direction, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { DragDropContext, Draggable, Droppable } from '../../../../src';
import { calculateGap } from '../../../../src/droppable/gap';

function App({ direction }: { direction?: Direction }) {
	return (
		<DragDropContext onDragEnd={() => {}}>
			<Droppable droppableId="droppable" direction={direction}>
				{(droppableProvided: DroppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						<Draggable draggableId="0" index={0}>
							{(draggableProvided: DraggableProvided) => (
								<div
									ref={draggableProvided.innerRef}
									data-testid="0"
									{...draggableProvided.draggableProps}
									{...draggableProvided.dragHandleProps}
								>
									Drag me!
								</div>
							)}
						</Draggable>
						<Draggable draggableId="1" index={1}>
							{(draggableProvided: DraggableProvided) => (
								<div
									ref={draggableProvided.innerRef}
									data-testid="1"
									{...draggableProvided.draggableProps}
									{...draggableProvided.dragHandleProps}
								>
									Drag me!
								</div>
							)}
						</Draggable>
						{droppableProvided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

const rectMap: Record<string, DOMRect> = {
	'0': DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 40 }),
	'1': DOMRect.fromRect({ x: 0, y: 60, width: 100, height: 40 }),
};

jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
	this: HTMLElement,
) {
	const testId = this.getAttribute('data-testid');
	invariant(typeof testId === 'string');
	return rectMap[testId];
});

const getComputedStyle = jest.spyOn(window, 'getComputedStyle');

describe('calculateGap()', () => {
	it('should return the distance between elements', () => {
		const { getByTestId } = render(<App />);

		const gapAfterFirst = calculateGap({
			direction: 'vertical',
			element: getByTestId('0'),
			where: 'after',
			contextId: '0',
		});
		expect(gapAfterFirst).toBe(20);

		const gapBeforeSecond = calculateGap({
			direction: 'vertical',
			element: getByTestId('1'),
			where: 'before',
			contextId: '0',
		});
		expect(gapBeforeSecond).toBe(gapAfterFirst);
	});

	it('should guess based on margins if there is no element before', () => {
		const { getByTestId } = render(<App />);

		const firstElement = getByTestId('0');

		// @ts-ignore UTEST-1630
		getComputedStyle.mockImplementation(function (el) {
			const style = new CSSStyleDeclaration();
			if (el === firstElement) {
				style.margin = '0px 0px 24px 0px';
				style.marginBottom = '24px';
			}
			return style;
		});

		const gapBeforeFirst = calculateGap({
			direction: 'vertical',
			element: firstElement,
			where: 'before',
			contextId: '0',
		});
		expect(gapBeforeFirst).toBe(24);
	});

	it('should guess based on margins if there is no element after', () => {
		const direction = 'horizontal';
		const { getByTestId } = render(<App direction={direction} />);

		const lastElement = getByTestId('1');

		// @ts-ignore UTEST-1630
		getComputedStyle.mockImplementation((el) => {
			const style = new CSSStyleDeclaration();
			if (el === lastElement) {
				style.margin = '0px 4px 0px 12px';
			}
			return style;
		});

		const gapAfterLast = calculateGap({
			direction,
			element: lastElement,
			where: 'after',
			contextId: '0',
		});
		expect(gapAfterLast).toBe(16);
	});

	it('should capture and report a11y violations', async () => {
		const { container } = render(<App />);

		await expect(container).toBeAccessible();
	});
});
