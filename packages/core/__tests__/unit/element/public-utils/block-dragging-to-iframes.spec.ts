import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import { blockDraggingToIFrames } from '../../../../src/entry-point/element/block-dragging-to-iframes';
import { type CleanupFn } from '../../../../src/entry-point/types';
import { appendToBody, getElements, reset, userEvent } from '../../_util';

afterEach(reset);

function isPointerEventsBlocked(iframe: HTMLIFrameElement): boolean {
	return (
		iframe.style.getPropertyValue('pointer-events') === 'none' &&
		iframe.style.getPropertyPriority('pointer-events') === 'important'
	);
}

it('should block dragging to iframes during a drag', () => {
	const [iframe] = getElements('iframe');
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(iframe, element),
		blockDraggingToIFrames({ element }),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('preview'),
			onDragStart: () => ordered.push('start'),
			onDrop: () => ordered.push('drop'),
		}),
	);

	fireEvent.dragStart(element);

	expect(ordered).toEqual(['preview']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// finish the lift

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// end the drag
	fireEvent.dragEnd(element);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	cleanup();
});

it('should block dragging to iframes even if unregistered during a drag', () => {
	const [iframe] = getElements('iframe');
	const [element, A] = getElements('div');
	const ordered: string[] = [];
	const unregister = blockDraggingToIFrames({ element });
	const cleanup = combine(
		appendToBody(iframe, element, A),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('preview'),
			onDragStart: () => ordered.push('start'),
			onDropTargetChange: () => ordered.push('change'),
			onDrop: () => ordered.push('drop'),
		}),
		dropTargetForElements({
			element: A,
		}),
	);

	userEvent.lift(element);

	expect(ordered).toEqual(['preview', 'start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	unregister();

	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['change']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// end the drag
	userEvent.drop(element);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	cleanup();
});

it('should block dragging to iframes [multiple registrations]', () => {
	const [iframe] = getElements('iframe');
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(iframe, element),
		blockDraggingToIFrames({ element }),
		blockDraggingToIFrames({ element }),
		blockDraggingToIFrames({ element }),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('preview'),
			onDragStart: () => ordered.push('start'),
			onDrop: () => ordered.push('drop'),
		}),
	);

	userEvent.lift(element);

	expect(ordered).toEqual(['preview', 'start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// end the drag
	fireEvent.dragEnd(element);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	cleanup();
});

it('should not block when there are no more registrations', () => {
	const [iframe] = getElements('iframe');
	const [element] = getElements('div');
	const ordered: string[] = [];
	const unregister = blockDraggingToIFrames({ element });
	const cleanup = combine(
		appendToBody(iframe, element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('preview'),
			onDragStart: () => ordered.push('start'),
			onDrop: () => ordered.push('drop'),
		}),
	);

	// first interaction: expecting to be blocked

	userEvent.lift(element);

	expect(ordered).toEqual(['preview', 'start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// end the drag
	fireEvent.dragEnd(element);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	// first interaction: no more blocking as fix is unregistered
	unregister();

	userEvent.lift(element);

	expect(ordered).toEqual(['preview', 'start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	// end the drag
	fireEvent.dragEnd(element);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	cleanup();
});

it('should not block dragging to iframes mounted during a drag', () => {
	const [iframe] = getElements('iframe');
	const [element, A] = getElements('div');
	const ordered: string[] = [];
	const cleanups: CleanupFn[] = [
		combine(
			appendToBody(iframe, element, A),
			blockDraggingToIFrames({ element }),
			draggable({
				element,
				onGenerateDragPreview: () => ordered.push('preview'),
				onDragStart: () => ordered.push('start'),
				onDrop: () => ordered.push('drop'),
				onDropTargetChange: () => ordered.push('change'),
			}),
			dropTargetForElements({
				element: A,
			}),
		),
	];

	userEvent.lift(element);

	expect(ordered).toEqual(['preview', 'start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// Adding a new iframe.
	// Expecting pointer events won't be added during this drag.
	const [addedIframe] = getElements('iframe');
	cleanups.push(appendToBody(addedIframe));

	// [] -> [A]
	fireEvent.dragEnter(A);

	expect(ordered).toEqual(['change']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(addedIframe)).toBe(false);
	expect(isPointerEventsBlocked(iframe)).toBe(true);

	// end the drag
	userEvent.drop(A);

	expect(ordered).toEqual(['drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);
	expect(isPointerEventsBlocked(addedIframe)).toBe(false);

	combine(...cleanups)();
});

it('should only block dragging for the provided element', () => {
	const [iframe] = getElements('iframe');
	const [first, second] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(iframe, first),
		blockDraggingToIFrames({ element: second }),
		draggable({
			element: first,
			onGenerateDragPreview: () => ordered.push('first:preview'),
			onDragStart: () => ordered.push('first:start'),
			onDrop: () => ordered.push('first:drop'),
		}),
		draggable({
			element: second,
			onGenerateDragPreview: () => ordered.push('second:preview'),
			onDragStart: () => ordered.push('second:start'),
			onDrop: () => ordered.push('second:drop'),
		}),
	);

	userEvent.lift(first);

	expect(ordered).toEqual(['first:preview', 'first:start']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	// end the drag
	userEvent.cancel();

	expect(ordered).toEqual(['first:drop']);
	ordered.length = 0;
	expect(isPointerEventsBlocked(iframe)).toBe(false);

	cleanup();
});
