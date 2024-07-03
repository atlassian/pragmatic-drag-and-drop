import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import { getInternalConfig } from '../../../src/shared/configuration';
import {
	advanceTimersToNextFrame,
	appendToBody,
	getInsidePoints,
	reset,
	setElementFromPoint,
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

const { child, parentScrollContainer } = setupBasicScrollContainer();

beforeEach(() => {
	parentScrollContainer.scrollTop = 0;
	parentScrollContainer.scrollLeft = 0;
});

const defaultConfig = getInternalConfig();

getInsidePoints(parentScrollContainer.getBoundingClientRect()).forEach((point) => {
	it(`should not scroll an element when over an element [${point.label}]`, () => {
		const ordered: string[] = [];

		const cleanup = combine(
			appendToBody(parentScrollContainer),
			setElementFromPoint(child),
			draggable({
				element: child,
				onDragStart: () => ordered.push('draggable:start'),
				onDrop: () => ordered.push('draggable:drop'),
			}),
			dropTargetForElements({
				element: child,
				onDragStart: () => ordered.push('dropTarget:start'),
				onDragEnter: () => ordered.push('dropTarget:enter'),
				onDragLeave: () => ordered.push('dropTarget:leave'),
				onDrop: () => ordered.push('dropTarget:drop'),
			}),
			unsafeOverflowAutoScrollForElements({
				element: parentScrollContainer,
				getOverflow: () => ({
					fromTopEdge: {
						top: 10000,
						left: 10000,
						right: 1000,
					},
					fromRightEdge: {
						top: 10000,
						bottom: 10000,
						right: 10000,
					},
					fromBottomEdge: {
						right: 10000,
						bottom: 10000,
						left: 10000,
					},
					fromLeftEdge: {
						top: 10000,
						bottom: 10000,
						left: 10000,
					},
				}),
			}),
			bind(parentScrollContainer, {
				type: 'scroll',
				listener() {
					ordered.push(`scroll event`);
				},
			}),
		);

		// setting some initial scroll
		parentScrollContainer.scrollLeft = 100;
		parentScrollContainer.scrollTop = 100;

		// lifting in middle of element, should not trigger auto scrolling
		userEvent.lift(child, {
			clientX:
				parentScrollContainer.getBoundingClientRect().left +
				parentScrollContainer.getBoundingClientRect().width / 2,
			clientY:
				parentScrollContainer.getBoundingClientRect().top +
				parentScrollContainer.getBoundingClientRect().height / 2,
		});

		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// on first frame, there is no auto scroll,
		// as we don't know what the scroll speed should be
		advanceTimersToNextFrame();
		stepScrollBy();

		expect(ordered).toEqual([]);

		// not expecting auto scrolling on the second frame as we are
		// over the second of the element
		advanceTimersToNextFrame();
		stepScrollBy();

		expect(ordered).toEqual([]);

		// updating where we are
		fireEvent.dragOver(child, point);

		// update won't be picked up until after the next frame
		advanceTimersToNextFrame();
		stepScrollBy();
		expect(ordered).toEqual([]);

		advanceTimersToNextFrame();
		stepScrollBy();
		expect(ordered).toEqual([]);

		// just being safe and checking nothing will happen
		jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);
		expect(ordered).toEqual([]);

		cleanup();
	});
});

// TODO: outside edge on main axis
// TODO: inside edge on main axis (but outside of the element)
