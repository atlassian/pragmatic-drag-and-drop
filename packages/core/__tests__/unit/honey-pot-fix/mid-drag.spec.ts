import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../../src/entry-point/element/adapter';
import {
	appendToBody,
	firePointer,
	getBubbleOrderedPath,
	getDefaultInput,
	getElements,
	setElementFromPointWithPath,
	userEvent,
} from '../_util';

import { findHoneyPot, getHoneyPot } from './_util';

it('should keep the honey pot even if the adapter is unmounted during the drag', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	// const cleanupElement = ;
	const cleanupDraggable = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);
	const cleanupMonitor = monitorForElements({
		onGenerateDragPreview: () => ordered.push('monitor:preview'),
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 12, clientY: 12 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	userEvent.lift(element);
	expect(getHoneyPot()).toBeTruthy();
	expect(ordered).toEqual([
		'draggable:preview',
		'monitor:preview',
		'draggable:start',
		'monitor:start',
	]);
	ordered.length = 0;

	cleanupDraggable();

	// drag still occurring even though only draggable has been removed
	// the adapter will have been removed
	expect(findHoneyPot()).toBeTruthy();

	fireEvent.dragEnd(window, { client: 12, clientY: 12 });
	expect(ordered).toEqual(['monitor:drop']);

	// honey pot still around until another user action
	expect(findHoneyPot()).toBeTruthy();

	firePointer.move(window, { clientX: 13, clientY: 13 });
	expect(findHoneyPot()).toBeFalsy();

	cleanupMonitor();
});

it('should shift to an updated "pointermove" location during a drag (firefox bug)', () => {
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

	firePointer.move(element, { clientX: 20, clientY: 22 });

	// pulled back 1px on the x and y from 20,22
	expect(honeyPot.style.left).toEqual('19px');
	expect(honeyPot.style.top).toEqual('21px');
	expect(honeyPot.style.width).toEqual('2px');
	expect(honeyPot.style.height).toEqual('2px');

	fireEvent.drop(element);

	cleanup();
});

it('should ignore the honey pot when dragging over it (case: [A])', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanups = [
		combine(
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
		),
	];

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 12, clientY: 12 });
	firePointer.move(element, { clientX: 14, clientY: 14 });
	firePointer.move(element, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();

	userEvent.lift(element, getDefaultInput({ clientX: 10, clientY: 10 }));

	expect(ordered).toEqual([
		'draggable:preview',
		'dropTarget:preview',
		'draggable:start',
		'dropTarget:start',
	]);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	cleanups.push(setElementFromPointWithPath(getBubbleOrderedPath([honeyPot, element])));

	// over the honey pot
	fireEvent.dragEnter(honeyPot, { clientX: 16, clientY: 16 });

	// no change event fired
	expect(ordered).toEqual([]);

	fireEvent.drop(element);

	combine(...cleanups)();
});

it('should ignore the honey pot when dragging over it (case: [A] → [B])', () => {
	const [A, B, draggableEl] = getElements('div');
	const ordered: string[] = [];
	const cleanups = [
		combine(
			appendToBody(A, B, draggableEl),
			draggable({
				element: draggableEl,
				onGenerateDragPreview: () => ordered.push('draggable:preview'),
				onDragStart: () => ordered.push('draggable:start'),
				onDropTargetChange: () => ordered.push('draggable:change'),
				onDrop: () => ordered.push('draggable:drop'),
			}),
			dropTargetForElements({
				element: A,
				onGenerateDragPreview: () => ordered.push('A:preview'),
				onDragStart: () => ordered.push('A:start'),
				onDragEnter: () => ordered.push('A:enter'),
				onDragLeave: () => ordered.push('A:leave'),
				onDrop: () => ordered.push('A:drop'),
			}),
			dropTargetForElements({
				element: B,
				onGenerateDragPreview: () => ordered.push('B:preview'),
				onDragStart: () => ordered.push('B:start'),
				onDragEnter: () => ordered.push('B:enter'),
				onDragLeave: () => ordered.push('B:leave'),
				onDrop: () => ordered.push('B:drop'),
			}),
		),
	];

	firePointer.down(draggableEl, { clientX: 10, clientY: 10 });
	firePointer.move(draggableEl, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(draggableEl, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();

	userEvent.lift(draggableEl, getDefaultInput({ clientX: 10, clientY: 10 }));

	expect(ordered).toEqual(['draggable:preview', 'draggable:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	// [] → [A]
	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['draggable:change', 'A:enter']);
	ordered.length = 0;

	// [A] → [B]
	// Going over the honey pot - but under the honey pot element will now be "B"
	cleanups.push(setElementFromPointWithPath(getBubbleOrderedPath([honeyPot, B])));
	fireEvent.dragEnter(honeyPot, { clientX: 16, clientY: 16 });

	expect(ordered).toEqual(['draggable:change', 'A:leave', 'B:enter']);
	ordered.length = 0;

	fireEvent.drop(B);
	expect(ordered).toEqual(['draggable:drop', 'B:drop']);

	combine(...cleanups)();
});

it('should keep the existing drop targets when dragging over the honey pot (case: [])', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanups = [
		combine(
			appendToBody(element),
			draggable({
				element,
				onGenerateDragPreview: () => ordered.push('draggable:preview'),
				onDragStart: () => ordered.push('draggable:start'),
				onDropTargetChange: () => ordered.push('draggable:change'),
				onDrop: () => ordered.push('draggable:drop'),
			}),
		),
	];

	firePointer.down(element, { clientX: 10, clientY: 10 });
	firePointer.move(element, { clientX: 12, clientY: 12 });
	firePointer.move(element, { clientX: 14, clientY: 14 });
	firePointer.move(element, { clientX: 16, clientY: 16 });
	fireEvent.dragStart(element, { clientX: 10, clientY: 10 });

	expect(findHoneyPot()).toBeFalsy();

	userEvent.lift(element, getDefaultInput({ clientX: 10, clientY: 10 }));

	expect(ordered).toEqual(['draggable:preview', 'draggable:start']);
	ordered.length = 0;

	const honeyPot = getHoneyPot();

	cleanups.push(setElementFromPointWithPath(getBubbleOrderedPath([honeyPot])));

	// over the honey pot
	fireEvent.dragEnter(honeyPot, { clientX: 16, clientY: 16 });

	// no change event fired
	expect(ordered).toEqual([]);

	fireEvent.drop(element);

	combine(...cleanups)();
});
