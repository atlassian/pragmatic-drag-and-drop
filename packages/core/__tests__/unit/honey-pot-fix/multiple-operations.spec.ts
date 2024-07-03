import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, firePointer, getElements, reset } from '../_util';

import { findHoneyPot } from './_util';

afterEach(reset);

it('should work between multiple drag operations (success)', () => {
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

	for (let i = 0; i < 5; i++) {
		firePointer.down(element, { clientX: 1 + i, clientY: 1 });
		firePointer.move(element, { clientX: 2 + i, clientY: 2 });
		fireEvent.dragStart(element);
		// being accurate
		firePointer.cancel(element, { clientX: 0, clientY: 0 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		fireEvent.drop(element);

		expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
		expect(findHoneyPot()).toBeTruthy();
		ordered.length = 0;
	}

	cleanup();
});

it('should work between multiple drag operations (cancel)', () => {
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

	for (let i = 0; i < 5; i++) {
		firePointer.down(element, { clientX: 1 + i, clientY: 1 });
		firePointer.move(element, { clientX: 2 + i, clientY: 2 });
		fireEvent.dragStart(element);
		// being accurate
		firePointer.cancel(element, { clientX: 0, clientY: 0 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		fireEvent.dragEnd(window);

		expect(ordered).toEqual(['draggable:change', 'dropTarget:leave', 'draggable:drop']);
		expect(findHoneyPot()).toBeTruthy();
		ordered.length = 0;
	}

	cleanup();
});

it('should work between multiple drag operations (broken drag)', () => {
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

	for (let i = 0; i < 5; i++) {
		firePointer.down(element, { clientX: 1 + i, clientY: 1 });
		firePointer.move(element, { clientX: 4 + i, clientY: 2 });
		fireEvent.dragStart(element, { clientX: 1 + i, clientY: 1 });
		// being accurate
		firePointer.cancel(element, { clientX: 0, clientY: 0 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// drag is broken
		fireEvent.pointerDown(window);

		expect(ordered).toEqual(['draggable:change', 'dropTarget:leave', 'draggable:drop']);
		expect(findHoneyPot()).toBeTruthy();
		ordered.length = 0;
	}

	cleanup();
});

it('should work between multiple drag operations (success + no pointer events)', () => {
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

	for (let i = 0; i < 5; i++) {
		// TODO: does this not work with clientX and clientY: 0
		fireEvent.dragStart(element, { clientX: 2 + i, clientY: 2 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		fireEvent.drop(element);

		expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
		expect(findHoneyPot()).toBeTruthy();
		ordered.length = 0;
	}

	cleanup();
});
