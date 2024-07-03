import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, firePointer, getElements, reset } from '../_util';

import { findHoneyPot, getHoneyPot } from './_util';

afterEach(reset);

// The initiating "dragstart" event listener is added to the `document` for the element event listener
const documentAddEventListener = jest.spyOn(document, 'addEventListener');
const documentRemoveEventListener = jest.spyOn(document, 'removeEventListener');

// Event listeners for the drag are added to the window
const windowAddEventListener = jest.spyOn(window, 'addEventListener');
const windowRemoveEventListener = jest.spyOn(window, 'removeEventListener');

jest.resetModules();

afterEach(() => {
	windowAddEventListener.mockClear();
	windowRemoveEventListener.mockClear();
	documentAddEventListener.mockClear();
	documentRemoveEventListener.mockClear();
	jest.resetModules();
});

it('should mount at the last "pointermove" location', () => {
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

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 12, clientY: 12 });
	firePointer.move(element, { clientX: 14, clientY: 14 });
	firePointer.move(element, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	// pulled back 1px on the x and y from 16,16
	expect(honeyPot.style.left).toEqual('15px');
	expect(honeyPot.style.top).toEqual('15px');
	expect(honeyPot.style.width).toEqual('2px');
	expect(honeyPot.style.height).toEqual('2px');

	fireEvent.drop(element);

	cleanup();
});

it('should mount at the starting position if has been no latest "pointermove" (can occur on mobile)', () => {
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

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 12, clientY: 12 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	{
		const honeyPot = getHoneyPot();
		// pulled back 1px on the x and y from 12,12
		expect(honeyPot.style.left).toEqual('11px');
		expect(honeyPot.style.top).toEqual('11px');
		expect(honeyPot.style.width).toEqual('2px');
		expect(honeyPot.style.height).toEqual('2px');
	}

	fireEvent.drop(element);

	expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
	ordered.length = 0;

	// clearing honey pot fix
	firePointer.down(element);

	// doing another drag without a "pointermove"
	fireEvent.dragStart(element, { clientX: 5, clientY: 5 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	{
		const honeyPot = getHoneyPot();

		// pulled back 1px on the x and y from 4,4
		expect(honeyPot.style.left).toEqual('4px');
		expect(honeyPot.style.top).toEqual('4px');
		expect(honeyPot.style.width).toEqual('2px');
		expect(honeyPot.style.height).toEqual('2px');
	}

	cleanup();
});

it('should clear the latest pointer move between interactions', () => {
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

	fireEvent.dragStart(element, { clientX: 2, clientY: 3 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	// pulled back 1px on the x and y from 2,3
	expect(honeyPot.style.left).toEqual('1px');
	expect(honeyPot.style.top).toEqual('2px');
	expect(honeyPot.style.width).toEqual('2px');
	expect(honeyPot.style.height).toEqual('2px');

	fireEvent.drop(element);

	cleanup();
});

it('should not go beyond the size of the window (backwards)', () => {
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

	firePointer.down(element, { clientX: 2, clientY: 2 });
	firePointer.move(element, { clientX: 0, clientY: 0 });
	fireEvent.dragStart(element, { clientX: 0, clientY: 0 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	expect(honeyPot.style.left).toEqual('0px');
	expect(honeyPot.style.top).toEqual('0px');
	expect(honeyPot.style.width).toEqual('2px');
	expect(honeyPot.style.height).toEqual('2px');

	fireEvent.drop(element);

	cleanup();
});

it('should not go beyond the size of the window (forwards)', () => {
	// validating setup
	expect(window.innerWidth).toBeGreaterThan(10);
	expect(window.innerHeight).toBeGreaterThan(10);

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

	firePointer.down(element, { clientX: window.innerWidth, clientY: window.innerHeight });
	firePointer.move(element, { clientX: window.innerWidth, clientY: window.innerHeight });
	fireEvent.dragStart(element, { clientX: window.innerWidth, clientY: window.innerHeight });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	// pulling back so that honey pot is in the window
	expect(honeyPot.style.left).toEqual(`${window.innerWidth - 2}px`);
	expect(honeyPot.style.top).toEqual(`${window.innerHeight - 2}px`);
	expect(honeyPot.style.width).toEqual('2px');
	expect(honeyPot.style.height).toEqual('2px');

	fireEvent.drop(element);

	cleanup();
});
