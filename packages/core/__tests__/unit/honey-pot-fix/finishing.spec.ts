import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, firePointer, getElements, reset, userEvent } from '../_util';

import { findHoneyPot } from './_util';

afterEach(reset);

// Using this approach so we can ensure that correct event contructers are being used
type Item = {
	eventName: string;
	fireEvent: (target: Element | Window) => void;
};

const items: Item[] = [
	{
		eventName: 'pointerdown',
		fireEvent: (target) => firePointer.down(target),
	},
	{
		eventName: 'pointermove',
		fireEvent: (target) => firePointer.move(target),
	},
	{
		eventName: 'focusin',
		fireEvent: (target) => fireEvent.focusIn(target),
	},
	{
		eventName: 'focusout',
		fireEvent: (target) => fireEvent.focusOut(target),
	},
	{
		eventName: 'dragstart',
		fireEvent: (target) => fireEvent.dragStart(target),
	},
	{
		eventName: 'dragenter',
		fireEvent: (target) => fireEvent.dragEnter(target),
	},
	{
		eventName: 'dragover',
		fireEvent: (target) => fireEvent.dragOver(target),
	},
];

items.forEach((item) => {
	test(`honey pot removed after post drop engagement (success) [${item.eventName}]`, () => {
		const [element] = getElements('div');
		const ordered: string[] = [];
		const cleanup = combine(
			appendToBody(element),
			draggable({
				element,
				onGenerateDragPreview: () => ordered.push('preview'),
				onDragStart: () => ordered.push('start'),
			}),
			dropTargetForElements({
				element,
			}),
		);

		firePointer.down(element, { clientX: 10, clientY: 10 });
		firePointer.move(element, { clientX: 16, clientY: 16 });
		fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(ordered).toEqual(['start']);
		expect(findHoneyPot()).toBeTruthy();

		// honey pot still around after the drop
		fireEvent.drop(element, { clientX: 10, clientY: 10 });
		expect(findHoneyPot()).toBeTruthy();

		// honey pot cleared after user engages with the page
		item.fireEvent(element);
		expect(findHoneyPot()).toBeFalsy();

		cleanup();
	});
});

items.forEach((item) => {
	test(`honey pot removed after post drop engagement (cancel) [${item.eventName}]`, () => {
		const [element] = getElements('div');
		const ordered: string[] = [];
		const cleanup = combine(
			appendToBody(element),
			draggable({
				element,
				onGenerateDragPreview: () => ordered.push('preview'),
				onDragStart: () => ordered.push('start'),
			}),
			dropTargetForElements({
				element,
			}),
		);

		firePointer.down(element, { clientX: 10, clientY: 10 });
		firePointer.move(element, { clientX: 16, clientY: 16 });
		fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

		expect(findHoneyPot()).toBeFalsy();
		expect(ordered).toEqual(['preview']);
		ordered.length = 0;

		// @ts-expect-error
		requestAnimationFrame.step();

		expect(ordered).toEqual(['start']);
		expect(findHoneyPot()).toBeTruthy();

		// honey pot still around after the cancel
		userEvent.cancel(element, { clientX: 10, clientY: 10 });
		expect(findHoneyPot()).toBeTruthy();

		// honey pot cleared after user engages with the page
		item.fireEvent(element);
		expect(findHoneyPot()).toBeFalsy();

		cleanup();
	});
});

test('honey pot removed after post drop engagement (success) [dropped on honey pot]', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('dropTarget:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
	);

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;
	expect(findHoneyPot()).toBeTruthy();

	// some random location
	fireEvent.dragOver(element, { clientX: 20, clientY: 20 });
	expect(findHoneyPot()).toBeTruthy();

	// Finishing over the top of the honey pot.
	// This will remove the honey pot as we are on the top of it
	fireEvent.drop(element, { clientX: 16, clientY: 16 });

	expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);

	// no honey pot as we are over the top of it!
	expect(findHoneyPot()).toBeFalsy();

	// checking we don't error on next event
	firePointer.down(element);
	expect(findHoneyPot()).toBeFalsy();

	cleanup();
});

test('honey pot removed after post drop engagement (cancel) [dropped on honey pot]', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
	);

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;
	expect(findHoneyPot()).toBeTruthy();

	// cancelling over the honey pot
	userEvent.cancel(element, { clientX: 16, clientY: 16 });

	expect(ordered).toEqual(['draggable:change', 'dropTarget:leave', 'draggable:drop']);
	ordered.length = 0;

	// no honey pot as we are over the top of it!
	expect(findHoneyPot()).toBeFalsy();

	// checking we don't error on next event
	firePointer.down(element);
	expect(findHoneyPot()).toBeFalsy();

	cleanup();
});
