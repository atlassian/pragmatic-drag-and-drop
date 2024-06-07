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
	setElementFromPointToBe,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

it('should not scroll scroll containers that have canScroll: () => false', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();
	const ordered: string[] = [];
	let isAutoScrollingAllowed: boolean = true;

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
			canScroll: () => isAutoScrollingAllowed,
		}),
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener: () => ordered.push('scroll event'),
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

	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	// disabling auto scrolling for the third frame
	// expecting no scroll will occur
	isAutoScrollingAllowed = false;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// enabling auto scrolling for the third frame
	// expecting a scroll to occur
	isAutoScrollingAllowed = true;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event']);

	cleanup();
});
