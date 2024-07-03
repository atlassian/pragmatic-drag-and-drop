import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, firePointer, getElements, reset } from '../_util';

import { findHoneyPot } from './_util';

afterEach(reset);

const windowAddEventListener = jest.spyOn(window, 'addEventListener');
const documentAddEventListener = jest.spyOn(document, 'addEventListener');
const windowRemoveEventListener = jest.spyOn(window, 'removeEventListener');
const documentRemoveEventListener = jest.spyOn(document, 'removeEventListener');

function clearMocks() {
	windowAddEventListener.mockClear();
	documentAddEventListener.mockClear();
	windowRemoveEventListener.mockClear();
	documentRemoveEventListener.mockClear();
}

beforeEach(() => clearMocks());

it('should cleanup event listeners when finished [not dropping on honey pot]', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);

	// our "honey pot" listener
	expect(windowAddEventListener).toHaveBeenCalledTimes(1);
	expect(windowAddEventListener).toHaveBeenNthCalledWith(
		1,
		'pointermove',
		expect.any(Function),
		expect.objectContaining({ capture: true }),
	);
	// our "element adapter" listener
	expect(documentAddEventListener).toHaveBeenCalledTimes(1);
	expect(documentAddEventListener).toHaveBeenNthCalledWith(
		1,
		'dragstart',
		expect.any(Function),
		// binding in the bubble phase
		undefined,
	);
	for (let i = 0; i < 5; i++) {
		clearMocks();

		firePointer.down(element, { clientX: 1 + i, clientY: 1 });
		firePointer.move(element, { clientX: 2 + i, clientY: 2 });

		// no more event listeners added yet
		expect(windowAddEventListener).not.toHaveBeenCalled();
		expect(documentAddEventListener).not.toHaveBeenCalled();

		// once the drag starts, a whole lot of listeners
		// will be added, including the honey pot one
		fireEvent.dragStart(element);

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// start the drag
		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// not dropping on the honey pot element so we keep it around
		fireEvent.drop(element, { clientX: 4 + i, clientY: 4 });

		expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
		ordered.length = 0;

		// honey pot still around after the drop
		expect(findHoneyPot()).toBeTruthy();

		// clear the honey pot
		firePointer.move(element);

		expect(findHoneyPot()).toBeFalsy();

		// all event listeners have been removed
		expect(windowRemoveEventListener).toHaveBeenCalled();
		expect(windowRemoveEventListener.mock.calls.length).toBe(
			windowAddEventListener.mock.calls.length,
		);
		// no event listeners added / removed on the document
		expect(documentAddEventListener).not.toHaveBeenCalled();
		expect(documentRemoveEventListener).not.toHaveBeenCalled();
	}

	cleanup();
});

it('should cleanup event listeners when finished [dropping on honey pot]', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);

	// our "honey pot" listener
	expect(windowAddEventListener).toHaveBeenCalledTimes(1);
	expect(windowAddEventListener).toHaveBeenNthCalledWith(1, 'pointermove', expect.any(Function), {
		capture: true,
	});
	// our "element adapter" listener
	expect(documentAddEventListener).toHaveBeenCalledTimes(1);
	expect(documentAddEventListener).toHaveBeenNthCalledWith(
		1,
		'dragstart',
		expect.any(Function),
		// binding in the bubble phase
		undefined,
	);

	for (let i = 0; i < 5; i++) {
		clearMocks();

		firePointer.down(element, { clientX: 1 + i, clientY: 1 });
		firePointer.move(element, { clientX: 2 + i, clientY: 2 });

		// no more event listeners added yet
		expect(windowAddEventListener).not.toHaveBeenCalled();
		expect(documentAddEventListener).not.toHaveBeenCalled();

		// once the drag starts, a whole lot of listeners
		// will be added, including the honey pot one
		fireEvent.dragStart(element);

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// start the drag
		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// dropping on the honey pot
		fireEvent.drop(element, { clientX: 2 + i, clientY: 2 });

		expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
		ordered.length = 0;

		// honey pot removed as we dropped on it
		expect(findHoneyPot()).toBeFalsy();

		// all event listeners have been removed
		expect(windowRemoveEventListener).toHaveBeenCalled();
		expect(windowRemoveEventListener.mock.calls.length).toBe(
			windowAddEventListener.mock.calls.length,
		);
		// no event listeners added / removed on the document
		expect(documentAddEventListener).not.toHaveBeenCalled();
		expect(documentRemoveEventListener).not.toHaveBeenCalled();

		// checking nothing else called after another user action

		clearMocks();

		firePointer.move(element);

		expect(windowAddEventListener).not.toHaveBeenCalled();
		expect(windowRemoveEventListener).not.toHaveBeenCalled();
		expect(documentAddEventListener).not.toHaveBeenCalled();
		expect(documentRemoveEventListener).not.toHaveBeenCalled();
	}

	cleanup();
});

it('should remove all event listeners when adapter is unmounted', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);

	expect(windowAddEventListener).toHaveBeenNthCalledWith(1, 'pointermove', expect.any(Function), {
		capture: true,
	});
	expect(windowRemoveEventListener).toHaveBeenCalledTimes(0);

	cleanup();

	expect(windowRemoveEventListener).toHaveBeenCalledTimes(1);
	expect(windowRemoveEventListener).toHaveBeenNthCalledWith(
		1,
		'pointermove',
		expect.any(Function),
		{
			capture: true,
		},
	);
});
