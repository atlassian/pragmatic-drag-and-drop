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
	getBubbleOrderedPath,
	reset,
	setElementFromPoint,
	setElementFromPointWithPath,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

import { getHoneyPot } from './_util';

jest.useFakeTimers();
setStartSystemTime();

afterEach(reset);

it('should not consider the honey pot when looking up the element the user is over', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		setElementFromPoint(child),
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
		}),
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

	const honeyPot = getHoneyPot();
	const path = getBubbleOrderedPath([honeyPot, child, parentScrollContainer]);
	const cleanupElementFrom = setElementFromPointWithPath(path);
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

	cleanup();
	cleanupElementFrom();
});
