import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

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

it('should start auto scrolling if imported after a drag has started', async () => {
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener: () => ordered.push('scroll event'),
		}),
	);

	const onCenterBottom = {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	};

	// lifting on mid bottom
	userEvent.lift(child, onCenterBottom);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame: no scroll would occur as we are waiting to know the frame duration
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// on first frame: no scroll as we are not registered for auto scrolling
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// just being safe and checking nothing is pending
	fireEvent.dragOver(child, onCenterBottom);
	jest.advanceTimersByTime(1000);
	expect(ordered).toEqual([]);

	// Okay, let's load in our auto scroller
	// eslint-disable-next-line import/dynamic-import-chunkname
	const { autoScrollForElements } = await import('../../../src/entry-point/element');

	const unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// triggering a "dragover" event with no input changes
	// this is need for the monitor "onDrag" function to fire
	fireEvent.dragOver(child, onCenterBottom);

	// first frame: waiting for scheduled `dragOver` event to be released in "onDrag"
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// second frame: waiting for a first frame to finish to know our frame duration
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// third frame: we should get an auto scroll
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual(['scroll event']);

	unbindAutoScrolling();
	cleanup();
});
