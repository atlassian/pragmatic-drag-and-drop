import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import { appendToBody, getBubbleOrderedTree, getDefaultInput, reset, userEvent } from '../../_util';

afterEach(reset);

test('scenario:start flushed by a drop', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDrop: () => ordered.push('a:drop'),
			onDrag: () => ordered.push('a:drag'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
		}),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
	);

	// start a lift
	fireEvent.dragStart(draggableEl);
	// 'start' event is still pending until the next animation frame
	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	userEvent.drop(A);
	expect(ordered).toEqual([
		// start event flushed
		'draggable:start',
		'a:start',
		// drop event
		'draggable:drop',
		'a:drop',
	]);

	cleanup();
});

test('scenario:start flushed by a cancel', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDrop: () => ordered.push('a:drop'),
			onDrag: () => ordered.push('a:drag'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
		}),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
	);

	// start a lift
	fireEvent.dragStart(draggableEl);
	// 'start' event is still pending until the next animation frame
	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	userEvent.cancel();
	expect(ordered).toEqual([
		// start event flushed
		'draggable:start',
		'a:start',
		// leaving A caused by cancel
		'draggable:change',
		'a:change',
		'a:leave',
		// drop event (won't be dropped in A)
		'draggable:drop',
	]);

	cleanup();
});

test('scenario:start flushed by a drop target change', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDrop: () => ordered.push('a:drop'),
			onDrag: () => ordered.push('a:drag'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
		}),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
	);

	// start a lift
	fireEvent.dragStart(draggableEl);
	// 'start' event is still pending until the next animation frame
	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	// [A] => []
	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual([
		// start event flushed
		'draggable:start',
		'a:start',
		// leaving A
		'draggable:change',
		'a:change',
		'a:leave',
	]);
	ordered.length = 0;

	// [] -> cancel
	fireEvent.dragEnd(document.body);
	expect(ordered).toEqual(['draggable:drop']);

	cleanup();
});

test('scenario:start flushed by a (throttled) drag', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDrop: () => ordered.push('a:drop'),
			onDrag: () => ordered.push('a:drag'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
		}),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
	);

	// start a lift
	fireEvent.dragStart(draggableEl);
	// 'start' event is still pending until the next animation frame
	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	// continuing to drag over A
	fireEvent.dragOver(A, getDefaultInput({ clientX: 10 }));
	fireEvent.dragOver(A, getDefaultInput({ clientX: 11 }));
	fireEvent.dragOver(A, getDefaultInput({ clientX: 12 }));

	// no immediate impact because drag events are throttled into the next frame
	expect(ordered).toEqual([]);

	// @ts-ignore
	requestAnimationFrame.step();

	expect(ordered).toEqual([
		// start flushed
		'draggable:start',
		'a:start',
		// single drag event
		'draggable:drag',
		'a:drag',
	]);
	ordered.length = 0;

	// [A] -> drop
	userEvent.drop(A);
	expect(ordered).toEqual(['draggable:drop', 'a:drop']);

	cleanup();
});
