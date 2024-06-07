import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import { type Input } from '../../../../src/entry-point/types';
import {
	appendToBody,
	getBubbleOrderedTree,
	getDefaultInput,
	getElements,
	reset,
	userEvent,
} from '../../_util';

afterEach(reset);

it('should only collect data once during a drag', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const getInitialData = jest.fn().mockImplementation(() => ({ name: 'Alex' }));
	const firstInput: Input = {
		...getDefaultInput(),
		pageX: 5,
	};
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
		}),
		draggable({
			element: draggableEl,
			getInitialData,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);

	fireEvent.dragStart(draggableEl, firstInput);

	expect(ordered).toEqual(['draggable:preview']);
	ordered.length = 0;
	expect(getInitialData).toHaveBeenCalled();

	// @ts-ignore
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start']);
	ordered.length = 0;

	// Dragging over A
	fireEvent.dragOver(A);
	// not called until the next frame
	expect(ordered).toEqual([]);
	// @ts-ignore
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:drag']);
	ordered.length = 0;

	// Leaving A
	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual(['draggable:change']);
	ordered.length = 0;

	// cancelling drag
	userEvent.cancel();
	expect(ordered).toEqual(['draggable:drop']);

	// getData only ever called once
	expect(getInitialData).toHaveBeenCalledTimes(1);

	cleanup();
});

it('should not request data from non-dragging draggables', () => {
	const [A, B] = getElements('div');
	const getDataA = jest.fn().mockImplementation(() => ({ name: 'A' }));
	const getDataB = jest.fn().mockImplementation(() => ({ name: 'B' }));

	const cleanup = combine(
		appendToBody(A, B),
		draggable({ element: A, getInitialData: getDataA }),
		draggable({ element: B, getInitialData: getDataB }),
	);

	userEvent.lift(A);

	expect(getDataA).toHaveBeenCalledTimes(1);
	expect(getDataB).not.toHaveBeenCalled();

	cleanup();
});
