import { createEvent, fireEvent } from '@testing-library/dom';
import { bind, bindAll } from 'bind-event-listener';

import { combine } from '../../../src/entry-point/combine';
import { draggable, monitorForElements } from '../../../src/entry-point/element/adapter';
import {
	addItemsToEvent,
	appendToBody,
	getBubbleOrderedTree,
	getElements,
	nativeDrag,
	reset,
	select,
	userEvent,
} from '../_util';

afterEach(reset);

test('do not start if the "dragstart" event is cancelled', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(window, {
			type: 'dragstart',
			listener: (event) => {
				ordered.push('cancelled');
				event.preventDefault();
			},
			// hit before our element adapter
			options: { capture: true },
		}),
	);

	fireEvent.dragStart(element);

	expect(ordered).toEqual(['cancelled']);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<div draggable="true">)', () => {
	const [managed, parent] = getElements('div');
	const [unmanaged] = getElements('div');
	unmanaged.draggable = true;
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(unmanaged),
		appendToBody(parent),
		// this is needed so that our element adapter start event listeners will be added
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<a>)', () => {
	const [managed, parent] = getElements('div');
	const [unmanaged] = getElements('a');
	unmanaged.href = 'https://domevents.dev';
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(unmanaged),
		appendToBody(parent),
		// this is needed so that our element adapter start event listeners will be added
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<img>)', () => {
	const [managed, parent] = getElements('div');
	const [unmanaged] = getElements('img');
	// a tiny transparent gif
	unmanaged.src =
		'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(unmanaged),
		appendToBody(parent),
		// this is needed so that our element adapter start event listeners will be added
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if a text selection is being dragged', () => {
	const [element] = getElements('div');
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
	);

	nativeDrag.startTextSelectionDrag({ element: paragraph });

	expect(ordered).toEqual([]);

	cleanup();
});

// Currently editor is leaning on the behaviour where a text selection drag where the event.target is
// a draggable element will trigger the element adapter.
// Ideally we unwind this in the future.
test.skip('do not start if a text selection is being dragged [when the event.target is a draggable element]', () => {
	const [child, parent] = getBubbleOrderedTree('div');
	child.prepend(document.createTextNode('child'));
	parent.prepend(document.createTextNode('parent'));

	// validating setup
	expect(parent.outerHTML).toBe('<div>parent<div>child</div></div>');
	expect(parent.textContent).toBe('parentchild');

	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(parent),
		draggable({
			element: child,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		select(child),
	);

	const event = new DragEvent('dragstart', {
		cancelable: true,
		bubbles: true,
	});

	addItemsToEvent({
		event,
		items: [
			{ type: 'text/plain', data: parent.textContent ?? '' },
			{ type: 'text/html', data: parent.outerHTML },
		],
	});

	child.dispatchEvent(event);
	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual([]);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<div draggable="true">) [child of draggable]', () => {
	const [unmanaged, managed] = getBubbleOrderedTree();
	unmanaged.draggable = true;
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(managed),
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<a>) [child of draggable]', () => {
	const [managed] = getElements('div');
	const [unmanaged] = getElements('a');
	unmanaged.href = 'https://domevents.dev';
	managed.appendChild(unmanaged);

	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(unmanaged),
		// this is needed so that our element adapter start event listeners will be added
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if an unmanaged element is being dragged (<img>) [child of draggable]', () => {
	const [managed] = getElements('div');
	const [unmanaged] = getElements('img');
	managed.appendChild(unmanaged);
	// a tiny transparent gif
	unmanaged.src =
		'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(unmanaged),
		// this is needed so that our element adapter start event listeners will be added
		draggable({
			element: managed,
			onGenerateDragPreview: () => ordered.push('managed:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
		bind(unmanaged, {
			type: 'dragstart',
			listener: () => ordered.push('unmanaged:drag-start'),
		}),
	);

	fireEvent.dragStart(unmanaged);

	expect(ordered).toEqual(['unmanaged:drag-start']);

	cleanup();
});

test('do not start if a text selection is being dragged [child of draggable]', () => {
	const [element] = getElements('div');
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	element.appendChild(paragraph);
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('monitor:preview'),
		}),
	);

	nativeDrag.startTextSelectionDrag({ element: paragraph });

	expect(ordered).toEqual([]);

	cleanup();
});

test('a unmanaged child draggable should not start dragging if a managed parent is dragging', () => {
	const [unmanagedChild, parent] = getBubbleOrderedTree();
	const ordered: string[] = [];
	unmanagedChild.draggable = true;
	const cleanup = combine(
		appendToBody(parent),
		draggable({
			element: parent,
			onGenerateDragPreview: () => ordered.push('parent:preview'),
		}),
		bind(unmanagedChild, {
			type: 'dragstart',
			listener: () => ordered.push('child:start'),
		}),
	);

	// the closest draggable element will be marked as the `event.target` for the dragstart event
	fireEvent.dragStart(parent);

	expect(ordered).toEqual(['parent:preview']);

	cleanup();
});

test('an unmanaged "drop" event should not be cancelled', () => {
	const [draggableEl, unmanagedDropTarget] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(draggableEl, unmanagedDropTarget),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: ({ location }) =>
				ordered.push(`draggable:drop - drop targets: ${location.current.dropTargets.length}`),
		}),
		bindAll(unmanagedDropTarget, [
			{
				type: 'dragover',
				listener: (event) => {
					ordered.push('unmanaged:over');
					event.preventDefault();
				},
			},
			{
				type: 'dragenter',
				listener: (event) => {
					event.preventDefault();
					ordered.push('unmanaged:enter');
				},
			},
			{
				type: 'drop',
				listener: () => {
					ordered.push('unmanaged:drop');
				},
			},
		]),
	);

	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['draggable:start']);
	ordered.length = 0;

	fireEvent.dragEnter(unmanagedDropTarget);

	expect(ordered).toEqual(['unmanaged:enter']);
	ordered.length = 0;

	const event = createEvent.drop(unmanagedDropTarget);
	fireEvent(unmanagedDropTarget, event);

	expect(event.defaultPrevented).toBe(false);
	expect(ordered).toEqual(['draggable:drop - drop targets: 0', 'unmanaged:drop']);

	cleanup();
});
