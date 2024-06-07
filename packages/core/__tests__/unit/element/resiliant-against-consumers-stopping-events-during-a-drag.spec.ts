import { fireEvent } from '@testing-library/dom';
import { bindAll } from 'bind-event-listener';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset, userEvent } from '../_util';

afterEach(reset);

test('stopping events in the bubble phase during a drag should not impact us [case: successful drop]', () => {
	const [draggableEl, A] = getElements('div');
	const ordered: string[] = [];
	function onEvent(event: DragEvent) {
		event.stopImmediatePropagation();
		ordered.push(`${event.type}:stopped`);
	}
	const cleanupEvents = bindAll(
		window,
		[
			{
				type: 'dragover',
				listener: onEvent,
			},
			{
				type: 'drag',
				listener: onEvent,
			},
			{
				type: 'dragenter',
				listener: onEvent,
			},
			{
				type: 'dragleave',
				listener: onEvent,
			},
			{
				type: 'drop',
				listener: onEvent,
			},
			{
				type: 'dragend',
				listener: onEvent,
			},
		],
		// adding in the bubble phase
		{ capture: false },
	);

	const cleanup = combine(
		appendToBody(draggableEl),
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('A:preview'),
			onDragStart: () => ordered.push('A:start'),
			onDrag: () => ordered.push('A:drag'),
			onDropTargetChange: () => ordered.push('A:change'),
			onDragEnter: () => ordered.push('A:enter'),
			onDragLeave: () => ordered.push('A:leave'),
			onDrop: () => ordered.push('A:drop'),
		}),
	);

	userEvent.lift(draggableEl);

	// we are not manually stopping any start events, this test is testing what happens after a drag starts
	expect(ordered).toEqual(['draggable:preview', 'draggable:start']);
	ordered.length = 0;

	// [] -> [A] with a dragEnter
	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['draggable:change', 'A:change', 'A:enter', 'dragenter:stopped']);
	ordered.length = 0;

	// dragleave doesn't do anything for us
	fireEvent.dragLeave(document.body, { relatedTarget: A });
	expect(ordered).toEqual(['dragleave:stopped']);
	ordered.length = 0;

	// dragging over A
	fireEvent.dragOver(A);
	expect(ordered).toEqual(['dragover:stopped']);
	ordered.length = 0;
	// our changes are flushing in the next animation frame
	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:drag', 'A:drag']);
	ordered.length = 0;

	// Dropping on A
	userEvent.drop(A);
	expect(ordered).toEqual(['draggable:drop', 'A:drop', 'drop:stopped']);
	ordered.length = 0;

	// dragend
	userEvent.cancel();
	expect(ordered).toEqual(['dragleave:stopped', 'dragend:stopped']);

	cleanup();
	cleanupEvents();
});

test('stopping events in the bubble phase during a drag should not impact us [case: cancelled drag]', () => {
	const [draggableEl, A] = getElements('div');
	const ordered: string[] = [];
	function onEvent(event: DragEvent) {
		event.stopImmediatePropagation();
		ordered.push(`${event.type}:stopped`);
	}
	const cleanupEvents = bindAll(
		window,
		[
			{
				type: 'dragover',
				listener: onEvent,
			},
			{
				type: 'drag',
				listener: onEvent,
			},
			{
				type: 'dragenter',
				listener: onEvent,
			},
			{
				type: 'dragleave',
				listener: onEvent,
			},
			{
				type: 'drop',
				listener: onEvent,
			},
			{
				type: 'dragend',
				listener: onEvent,
			},
		],
		// adding in the bubble phase
		{ capture: false },
	);

	const cleanup = combine(
		appendToBody(draggableEl),
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDrag: () => ordered.push('draggable:drag'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('A:preview'),
			onDragStart: () => ordered.push('A:start'),
			onDrag: () => ordered.push('A:drag'),
			onDropTargetChange: () => ordered.push('A:change'),
			onDragEnter: () => ordered.push('A:enter'),
			onDragLeave: () => ordered.push('A:leave'),
			onDrop: () => ordered.push('A:drop'),
		}),
	);

	userEvent.lift(draggableEl);

	// we are not manually stopping any start events, this test is testing what happens after a drag starts
	expect(ordered).toEqual(['draggable:preview', 'draggable:start']);
	ordered.length = 0;

	// [] -> [A] with a dragEnter
	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['draggable:change', 'A:change', 'A:enter', 'dragenter:stopped']);
	ordered.length = 0;

	// dragleave doesn't do anything for us
	fireEvent.dragLeave(document.body, { relatedTarget: A });
	expect(ordered).toEqual(['dragleave:stopped']);
	ordered.length = 0;

	// dragging over A
	fireEvent.dragOver(A);
	expect(ordered).toEqual(['dragover:stopped']);
	ordered.length = 0;
	// our changes are flushing in the next animation frame
	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:drag', 'A:drag']);
	ordered.length = 0;

	// Cancelling the drag
	userEvent.cancel();
	expect(ordered).toEqual([
		'draggable:change',
		'A:change',
		'A:leave',
		'dragleave:stopped',
		// the draggable will get 'drop' in response to 'dragend'
		'draggable:drop',
		'dragend:stopped',
	]);

	cleanup();
	cleanupEvents();
});
