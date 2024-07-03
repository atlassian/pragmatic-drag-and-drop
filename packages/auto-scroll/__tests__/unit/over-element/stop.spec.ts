import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { autoScrollForElements } from '../../../src/entry-point/element';
import {
	advanceTimersToNextFrame,
	appendToBody,
	reset,
	setElementFromPoint,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

it('should stop scrolling when a drag ends', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
		setElementFromPoint(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(
					`scroll event {scrollLeft: ${parentScrollContainer.scrollLeft}, scrollTop: ${parentScrollContainer.scrollTop}}`,
				);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollTop = 500;
	parentScrollContainer.scrollLeft = 500;

	userEvent.lift(child, { clientX: 1, clientY: 1 });

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// Second frame: an auto scroll will occur

	advanceTimersToNextFrame();
	stepScrollBy();

	// Scroll backwards on both axis by 1px
	expect(ordered).toEqual(['scroll event {scrollLeft: 499, scrollTop: 499}']);
	ordered.length = 0;

	// Third frame: auto scrolling should occur again
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event {scrollLeft: 498, scrollTop: 498}']);
	ordered.length = 0;

	// End the drag
	userEvent.drop(child);
	expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
	ordered.length = 0;

	// Fourth frame: no auto scroll should occur
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	cleanup();
});

it('should not start scrolling if the drag is cancelled in the first frame', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
		setElementFromPoint(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(
					`scroll event {scrollLeft: ${parentScrollContainer.scrollLeft}, scrollTop: ${parentScrollContainer.scrollTop}}`,
				);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollTop = 500;
	parentScrollContainer.scrollLeft = 500;

	userEvent.lift(child, { clientX: 1, clientY: 1 });

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	// End the drag
	userEvent.drop(child);

	expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
	ordered.length = 0;

	// Second frame: an auto scroll will normally have occurred, but the drag was cancelled.
	advanceTimersToNextFrame();
	stepScrollBy();

	// no scroll events should have occurred
	expect(ordered).toEqual([]);

	cleanup();
});
