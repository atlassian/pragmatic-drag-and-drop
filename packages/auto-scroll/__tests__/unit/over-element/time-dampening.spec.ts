import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import {
	autoScrollForElements,
	autoScrollWindowForElements,
} from '../../../src/entry-point/element';
import { getInternalConfig } from '../../../src/shared/configuration';
import {
	advanceTimersToNextFrame,
	appendToBody,
	getBubbleOrderedTree,
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

const defaultConfig = getInternalConfig();
const maxScrollPerFrame = defaultConfig.maxPixelScrollPerSecond / 60;

beforeEach(() => {
	// resetting document scroll
	document.documentElement.scrollTop = 0;
	document.documentElement.scrollLeft = 0;
});

// Splitting up, right, down and left into separate cases rather than a loop, because doing it
// in one helper loop was super messy and difficult to follow
it('should dampen the acceleration of auto scrolling [new drag] - up', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollTop = child.getBoundingClientRect().height / 2;
	const initialScrollTop = parentScrollContainer.scrollTop;
	const initialScrollLeft = parentScrollContainer.scrollLeft;

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY:
			// when on the 'top' side we are scrolling up
			parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	let lastScrollTop = parentScrollContainer.scrollTop;
	let lastScrollChangeSize = 0;

	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		// first few scrolls will just be 1px
		'initial-acceleration': false,
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	// Keep going until we cannot scroll any more
	while (parentScrollContainer.scrollTop > 0) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// asserting that one scroll event has occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollTop = parentScrollContainer.scrollTop;
		const scrollChange = currentScrollTop - lastScrollTop;

		// we are scrolling backwards so our change will be negative
		expect(scrollChange).toBeLessThan(0);

		const scrollChangeSize = Math.abs(scrollChange);

		lastScrollTop = currentScrollTop;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			// We are still not at the max scroll speed
			expect(scrollChangeSize).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);

			if (scrollChangeSize === 1) {
				expect(scrollChangeSize).toBe(1);
				casesHit['initial-acceleration'] = true;
			} else {
				// Each scroll is bigger than the last
				expect(scrollChangeSize).toBeGreaterThan(lastScrollChangeSize);
				casesHit.acceleration = true;
			}

			lastScrollChangeSize = scrollChangeSize;
			continue;
		}
		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (parentScrollContainer.scrollTop !== 0) {
			expect(scrollChangeSize).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChangeSize).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;

		// We can finish here (even though the exit condition would catch us too)
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(parentScrollContainer.scrollTop).toBe(0);
	// asserting all our cases where hit
	expect(casesHit['initial-acceleration']).toBe(true);
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// scrollLeft should not have changed
	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);

	cleanup();
});

it('should dampen the acceleration of auto scrolling [new drag] - right', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollLeft = child.getBoundingClientRect().width / 2;
	const initialScrollLeft = parentScrollContainer.scrollLeft;
	const initialScrollTop = parentScrollContainer.scrollTop;

	// lifting the mid point of the right edge
	userEvent.lift(child, {
		clientX: parentScrollContainer.getBoundingClientRect().right,
		clientY:
			parentScrollContainer.getBoundingClientRect().top +
			parentScrollContainer.getBoundingClientRect().height / 2,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);

	let lastScrollLeft = parentScrollContainer.scrollLeft;
	let lastScrollChange = 0;

	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		// first few scrolls will just be 1px
		'initial-acceleration': false,
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	const maxScrollLeft = parentScrollContainer.scrollWidth - parentScrollContainer.clientWidth;

	// Keep going until we cannot scroll any more
	while (parentScrollContainer.scrollLeft <= maxScrollLeft) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// asserting that one scroll event has occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollLeft = parentScrollContainer.scrollLeft;
		const scrollChange = currentScrollLeft - lastScrollLeft;

		// we are scrolling forward so our change will be positive
		expect(scrollChange).toBeGreaterThan(0);

		lastScrollLeft = currentScrollLeft;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			// We are still not at the max scroll speed
			expect(scrollChange).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);

			if (scrollChange === 1) {
				casesHit['initial-acceleration'] = true;
				expect(scrollChange).toBe(1);
			} else {
				// Each scroll is bigger than the last
				casesHit.acceleration = true;
				expect(scrollChange).toBeGreaterThan(lastScrollChange);
			}

			lastScrollChange = scrollChange;
			continue;
		}
		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (parentScrollContainer.scrollLeft < maxScrollLeft) {
			expect(scrollChange).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChange).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;

		// We can finish here (even though the exit condition would catch us too)
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(parentScrollContainer.scrollLeft).toBe(maxScrollLeft);
	// asserting all our cases where hit
	expect(casesHit['initial-acceleration']).toBe(true);
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// scrollTop should not have changed
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	cleanup();
});

it('should dampen the acceleration of auto scrolling [new drag] - down', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollTop = child.getBoundingClientRect().height / 2;
	const initialScrollTop = parentScrollContainer.scrollTop;
	const initialScrollLeft = parentScrollContainer.scrollLeft;

	// lifting on the mid point of the bottom edge
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	let lastScrollTop = parentScrollContainer.scrollTop;
	let lastScrollChange = 0;

	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		// first few scrolls will just be 1px
		'initial-acceleration': false,
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	const maxScrollTop = parentScrollContainer.scrollHeight - parentScrollContainer.clientHeight;

	// Keep going until we cannot scroll any more
	while (parentScrollContainer.scrollTop <= maxScrollTop) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// asserting that one scroll event has occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollTop = parentScrollContainer.scrollTop;
		const scrollChange = currentScrollTop - lastScrollTop;

		// we are scrolling forward so our change will be positive
		expect(scrollChange).toBeGreaterThan(0);

		lastScrollTop = currentScrollTop;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			// We are still not at the max scroll speed
			expect(scrollChange).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);

			if (scrollChange === 1) {
				expect(scrollChange).toBe(1);
				casesHit['initial-acceleration'] = true;
			} else {
				// Each scroll is bigger than the last
				expect(scrollChange).toBeGreaterThan(lastScrollChange);
				casesHit.acceleration = true;
			}

			lastScrollChange = scrollChange;
			continue;
		}
		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (parentScrollContainer.scrollTop < maxScrollTop) {
			expect(scrollChange).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChange).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;

		// We can finish here (even though the exit condition would catch us too)
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(parentScrollContainer.scrollTop).toBe(maxScrollTop);
	// asserting all our cases where hit
	expect(casesHit['initial-acceleration']).toBe(true);
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// scrollLeft should not have changed
	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);

	cleanup();
});

it('should dampen the acceleration of auto scrolling [new drag] - left', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollLeft = child.getBoundingClientRect().width / 2;
	const initialScrollLeft = parentScrollContainer.scrollLeft;
	const initialScrollTop = parentScrollContainer.scrollTop;

	// lifting on the vertical midpoint of the left edge of the container
	userEvent.lift(child, {
		clientX: parentScrollContainer.getBoundingClientRect().left,
		clientY:
			parentScrollContainer.getBoundingClientRect().top +
			parentScrollContainer.getBoundingClientRect().height / 2,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);

	let lastScrollLeft = parentScrollContainer.scrollLeft;
	let lastScrollChangeSize = 0;

	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		// first few scrolls will just be 1px
		'initial-acceleration': false,
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	// Keep going until we cannot scroll any more
	while (parentScrollContainer.scrollLeft > 0) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// asserting that one scroll event has occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollLeft = parentScrollContainer.scrollLeft;
		const scrollChange = currentScrollLeft - lastScrollLeft;

		// we are scrolling backwards so our change will be negative
		expect(scrollChange).toBeLessThan(0);

		const scrollChangeSize = Math.abs(scrollChange);

		lastScrollLeft = currentScrollLeft;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			if (scrollChangeSize === 1) {
				expect(scrollChangeSize).toBe(1);
				casesHit['initial-acceleration'] = true;
			} else {
				// Each scroll is bigger than the last
				expect(scrollChangeSize).toBeGreaterThan(lastScrollChangeSize);
				casesHit.acceleration = true;
			}

			lastScrollChangeSize = scrollChangeSize;
			continue;
		}
		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (parentScrollContainer.scrollLeft !== 0) {
			expect(scrollChangeSize).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChangeSize).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;

		// We can finish here (even though the exit condition would catch us too)
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(parentScrollContainer.scrollLeft).toBe(0);
	// asserting all our cases where hit
	expect(casesHit['initial-acceleration']).toBe(true);
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// scrollTop should not have changed
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	cleanup();
});

it('should dampen the acceleration of auto scrolling [entering into a new drop target]', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const [original] = getBubbleOrderedTree();
	const originalRect = DOMRect.fromRect({
		x: parentScrollContainer.getBoundingClientRect().x + 20,
		y: parentScrollContainer.getBoundingClientRect().y + 20,
		width: 100,
		height: 100,
	});
	original.getBoundingClientRect = () => originalRect;

	const ordered: string[] = [];

	let unsetElementFromPoint = setElementFromPointToBe(original);

	const cleanup = combine(
		appendToBody(original),
		appendToBody(parentScrollContainer),
		draggable({
			element: original,
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
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting in center of original
	userEvent.lift(original, {
		clientX: originalRect.left + originalRect.width / 2,
		clientY: originalRect.top + originalRect.height / 2,
	});

	// not over the inner element
	expect(ordered).toEqual(['draggable:start']);
	ordered.length = 0;

	// we are expecting no auto scrolling as we are currently not over the drop target
	for (let i = 0; i < 10; i++) {
		advanceTimersToNextFrame();
		stepScrollBy();
	}
	// also just being safe and ensuring we are totally outside any initial time dampening
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);
	stepScrollBy();

	expect(ordered).toEqual([]);
	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// dragging over the top center of our scroll container
	// while over the 'inner' element
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(child);

	fireEvent.dragEnter(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	// we are now over the drop target
	expect(ordered).toEqual(['dropTarget:enter']);

	// no scrolling has occurred yet
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	let lastScrollTop = parentScrollContainer.scrollTop;
	let lastScrollChange = 0;
	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	// Keep going until we cannot scroll any more
	while (parentScrollContainer.scrollTop > 0) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollTop = parentScrollContainer.scrollTop;
		const scrollChange = Math.abs(currentScrollTop - lastScrollTop);
		lastScrollTop = currentScrollTop;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			// We are still not at the max scroll speed
			expect(scrollChange).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);
			// Each scroll is bigger than the last
			expect(scrollChange).toBeGreaterThan(lastScrollChange);
			casesHit.acceleration = true;
			continue;
		}

		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (parentScrollContainer.scrollTop !== 0) {
			expect(scrollChange).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChange).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;
		// We can finish here
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(parentScrollContainer.scrollTop).toBe(0);
	// asserting all our cases where hit
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// TODO: pull out into separate test?
	// checking that no more scrolls will occur
	ordered.length = 0;
	jest.advanceTimersByTime(defaultConfig.maxPixelScrollPerSecond * 2);
	expect(ordered).toEqual([]);

	cleanup();
	unsetElementFromPoint();
});

it('should start time dampening from when the element is dragged over, even if auto scrolling is not being triggered', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		setElementFromPointToBe(child),
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
		autoScrollForElements({
			element: parentScrollContainer,
		}),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener: () => ordered.push('scroll event'),
		}),
	);

	// Scroll container is now looking over the center of the element
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting in center of the the scroll container, this should not trigger any auto scrolling
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

	// first frame: no scroll expected even if we were auto scrolling
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// second frame: if we were in a hitbox for auto scrolling, scroll would occur.
	// not expecting any scroll event as we are not in a hitbox for auto scrolling.
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// ensuring we are out of the time dampening period
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);
	stepScrollBy();
	// still expecting no scroll events
	expect(ordered).toEqual([]);

	// moving over the bottom center - this should trigger an auto scroll
	fireEvent.dragOver(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});

	// not expecting the change to be picked up until the frame after the current frame
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	// now scrolling at max speed as time dampening is finished
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(after - before).toBe(maxScrollPerFrame);
		expect(ordered).toEqual(['scroll event']);
	}

	cleanup();
});

it('should reset time dampening when re-entering a scrollable element', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];

	let unsetElementFromPoint = setElementFromPointToBe(child);

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
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
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
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	function execute() {
		let lastScrollTop = parentScrollContainer.scrollTop;
		let lastScrollChange = 0;

		let engagementStart: number | null = null;

		// tracking the various cases to make sure we are actually hitting them
		const casesHit = {
			acceleration: false,
			'time-dampening-finished': false,
			'time-dampening-finished-last-scroll': false,
		};

		// Keep going until we cannot scroll any more
		while (parentScrollContainer.scrollTop > 0) {
			advanceTimersToNextFrame();
			stepScrollBy();

			// Engagement not set until first active scroll
			if (!engagementStart) {
				engagementStart = Date.now();
			}

			const currentScrollTop = parentScrollContainer.scrollTop;
			const scrollChange = Math.abs(currentScrollTop - lastScrollTop);
			lastScrollTop = currentScrollTop;

			const now = Date.now();
			const duration = now - engagementStart;

			// Case 1: in the time dampening period
			if (duration < defaultConfig.timeDampeningDurationMs) {
				// We are still not at the max scroll speed
				expect(scrollChange).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);
				// Each scroll is bigger than the last
				expect(scrollChange).toBeGreaterThan(lastScrollChange);
				casesHit.acceleration = true;
				continue;
			}

			// Case 2: scrolling at max speed, but not finished scrolling
			// Expecting max scroll speed
			if (parentScrollContainer.scrollTop !== 0) {
				expect(scrollChange).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
				casesHit['time-dampening-finished'] = true;
				continue;
			}
			// Case 3: the last scroll finished the scrolling of the element.
			// The last scroll could be slightly less than the max scroll amount
			// as there might not have been the max scroll amount left to scroll
			expect(scrollChange).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished-last-scroll'] = true;
			// We can finish here
			break;
		}

		// scroll container has been scrolled all the way to the top
		expect(parentScrollContainer.scrollTop).toBe(0);
		// asserting all our cases where hit
		expect(casesHit.acceleration).toBe(true);
		expect(casesHit['time-dampening-finished']).toBe(true);
		expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);
	}

	// first auto scroll
	execute();
	ordered.length = 0;

	// leaving the drop target
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(document.body);
	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['dropTarget:leave']);
	ordered.length = 0;

	// let some time pass
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs * 2);

	// no scrolling has occurred in this time
	expect(ordered).toEqual([]);

	// let's drag back over the drop target
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(child);
	fireEvent.dragEnter(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	// we are now over the drop target
	expect(ordered).toEqual(['dropTarget:enter']);
	ordered.length = 0;

	// our auto scroll should be in action
	// TODO: be a bit more elegant here?
	parentScrollContainer.scrollTop = initialScrollTop;
	execute();

	cleanup();
	unsetElementFromPoint();
});

it('should not reset time dampening if an element is re-registered (in the same frame)', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		setElementFromPointToBe(child),
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
	);

	let unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// Scroll container is now looking over the center of the element
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(maxScrollPerFrame);
	}

	// Rebinding the auto scroll element
	unbindAutoScrolling();
	unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// Triggering another auto scroll - should be at the max speed
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(maxScrollPerFrame);
	}

	cleanup();
});

it('should not reset time dampening if window scrolling is re-registered (in the same frame)', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const cleanup = combine(
		appendToBody(element),
		setElementFromPointToBe(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	const initialScrollTop = document.documentElement.scrollTop;
	let unbindAutoScrolling = autoScrollWindowForElements();

	userEvent.lift(element, {
		clientX: document.documentElement.clientLeft + document.documentElement.clientWidth / 2,
		clientY: document.documentElement.clientLeft + document.documentElement.clientHeight,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(document.documentElement.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(document.documentElement.scrollTop).toBeGreaterThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(maxScrollPerFrame);
	}

	// Re-registering window scrolling
	unbindAutoScrolling();
	unbindAutoScrolling = autoScrollWindowForElements();

	// Triggering another auto scroll - should be at the max speed
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(maxScrollPerFrame);
	}

	unbindAutoScrolling();
	cleanup();
});

it('should reset time dampening if a element is re-registered in a future frame', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		setElementFromPointToBe(child),
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

		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(
					`scroll event {scrollLeft: ${parentScrollContainer.scrollLeft}, scrollTop: ${parentScrollContainer.scrollTop}}`,
				);
			},
		}),
	);

	let unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// Scroll container is now looking over the center of the element
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(maxScrollPerFrame);
	}

	// Unbinding the auto scroll element
	unbindAutoScrolling();

	// Triggering a scroll - should not scroll the scroll container
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before).toBe(after);
	}

	// Binding the scrollable element again
	unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// Triggering another auto scroll - should be the minimum scroll
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(1);
	}

	cleanup();
	unbindAutoScrolling();
});

it('should reset time dampening if a element scroll is disabled and re-enabled in a future frame', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];
	let isAutoScrollingAllowed: boolean = true;

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		setElementFromPointToBe(child),
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
		autoScrollForElements({
			element: parentScrollContainer,
			canScroll: () => isAutoScrollingAllowed,
		}),
	);

	// Scroll container is now looking over the center of the element
	const initialScrollTop = child.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	// scroll container has still not scrolled
	expect(ordered).toEqual([]);
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(maxScrollPerFrame);
	}

	// No longer allowing auto scrolling
	isAutoScrollingAllowed = false;

	// Triggering a scroll - should not scroll the scroll container
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before).toBe(after);
	}

	// Binding the scrollable element again
	isAutoScrollingAllowed = true;

	// Triggering another auto scroll - should be the minimum scroll
	{
		const before = parentScrollContainer.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = parentScrollContainer.scrollTop;
		expect(before - after).toBe(1);
	}

	cleanup();
});

it('should reset time dampening if a window scrolling is re-registered in a future frame', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const cleanup = combine(
		appendToBody(element),
		setElementFromPointToBe(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	const initialScrollTop = document.documentElement.scrollTop;
	let unbindAutoScrolling = autoScrollWindowForElements();

	userEvent.lift(element, {
		clientX: document.documentElement.clientLeft + document.documentElement.clientWidth / 2,
		clientY: document.documentElement.clientLeft + document.documentElement.clientHeight,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(document.documentElement.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(document.documentElement.scrollTop).toBeGreaterThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(maxScrollPerFrame);
	}

	// un-registering window scrolling
	unbindAutoScrolling();

	// Triggering another auto scroll - should not scroll
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBe(before);
	}

	unbindAutoScrolling = autoScrollWindowForElements();

	// Triggering another auto scroll - should be the minimum scroll
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(1);
	}

	unbindAutoScrolling();
	cleanup();
});

it('should reset time dampening if a window scrolling is re-enabled in a future frame', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];
	let isAutoScrollingAllowed: boolean = true;

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const cleanup = combine(
		appendToBody(element),
		setElementFromPointToBe(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		autoScrollWindowForElements({
			canScroll: () => isAutoScrollingAllowed,
		}),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	const initialScrollTop = document.documentElement.scrollTop;

	userEvent.lift(element, {
		clientX: document.documentElement.clientLeft + document.documentElement.clientWidth / 2,
		clientY: document.documentElement.clientLeft + document.documentElement.clientHeight,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	// scroll container has still not scrolled
	expect(ordered).toEqual([]);
	expect(document.documentElement.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has now been scrolled
	expect(document.documentElement.scrollTop).toBeGreaterThan(initialScrollTop);
	expect(ordered).toEqual(['window:scroll']);
	ordered.length = 0;

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(maxScrollPerFrame);
	}

	// disabling auto scroll
	isAutoScrollingAllowed = false;

	// Triggering another auto scroll - should not scroll
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBe(before);
	}

	// re-enabling auto scrolling
	isAutoScrollingAllowed = true;

	// Triggering another auto scroll - should be the minimum scroll
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after - before).toBe(1);
	}

	cleanup();
});

it('should not dampen time after the time dampening period has finished [on original axis]', () => {
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
		setElementFromPointToBe(child),
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
	const initialScrollTop = parentScrollContainer.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;
	// just checking I got the math right
	expect(initialScrollTop).toBe(500);

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has still been scrolled
	expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	// just asserting we have a setup that will execute the test correctly
	const beforeScrollTop = parentScrollContainer.scrollTop;
	expect(beforeScrollTop).toBeLessThan(initialScrollTop);
	// our next scroll should have room for more than the max scroll
	// (otherwise we are not testing what we expect)
	expect(beforeScrollTop).toBeGreaterThan(maxScrollPerFrame);

	// Triggering another frame
	// we are expecting the scroll change to be the maximum allowed
	advanceTimersToNextFrame();
	stepScrollBy();

	const afterScrollTop = parentScrollContainer.scrollTop;
	expect(beforeScrollTop - afterScrollTop).toBe(maxScrollPerFrame);

	cleanup();
});

it('should not dampen time after the time dampening period has finished [on different axis]', () => {
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
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(
					`scroll event {scrollLeft: ${parentScrollContainer.scrollLeft}, scrollTop: ${parentScrollContainer.scrollTop}}`,
				);
			},
		}),
	);

	// Initial scrolling on the top and left
	const initialScrollTop = parentScrollContainer.getBoundingClientRect().height / 2;
	parentScrollContainer.scrollTop = initialScrollTop;
	const initialScrollLeft = parentScrollContainer.getBoundingClientRect().width / 2;
	parentScrollContainer.scrollLeft = initialScrollLeft;

	// checking our initial math is correct
	expect(parentScrollContainer.scrollLeft).toBe(500);

	// lifting on the top vertical edge of the container
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scroll container has still not scrolled
	expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

	// on the second frame we are performing our initial scroll
	// which will mark the first engagement
	// (and will also perform the first scroll)
	advanceTimersToNextFrame();
	stepScrollBy();

	// scroll container has been scrolled on the top
	expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);
	// scroll container has not been scrolled on the left yet
	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);
	// ensuring we have enough room to do a max scroll
	expect(parentScrollContainer.scrollLeft).toBeGreaterThan(maxScrollPerFrame);

	// Complete the time dampening duration
	jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

	expect(parentScrollContainer.scrollLeft).toBe(initialScrollLeft);

	const rect = parentScrollContainer.getBoundingClientRect();
	// mid center on left edge
	fireEvent.dragOver(child, {
		clientX: rect.left,
		clientY: rect.top + rect.height,
	});

	// first frame: this will update the 'input' for a drag (update changes are throttled inside of a frame)
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(initialScrollLeft).toBe(parentScrollContainer.scrollLeft);

	// this should now trigger an auto scroll of the max scroll (no time dampening)
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(initialScrollLeft - parentScrollContainer.scrollLeft).toBe(maxScrollPerFrame);

	cleanup();
});

// only checking forward direction, as code path is the same as scroll containers
it('should reset time dampening when doing repeated drag operations', () => {
	const { parentScrollContainer, child } = setupBasicScrollContainer();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		setElementFromPointToBe(child),
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
		autoScrollForElements({
			element: parentScrollContainer,
		}),
	);

	function dragOperation() {
		// Scroll container is now looking over the center of the element
		const initialScrollTop = child.getBoundingClientRect().height / 2;
		parentScrollContainer.scrollTop = initialScrollTop;

		// lifting on the top vertical edge of the container
		userEvent.lift(child, {
			clientX:
				parentScrollContainer.getBoundingClientRect().left +
				parentScrollContainer.getBoundingClientRect().width / 2,
			clientY: parentScrollContainer.getBoundingClientRect().top,
		});

		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// on first frame, there is no auto scroll as
		// we don't know what the scroll speed should be until
		// a single frame has passed
		advanceTimersToNextFrame();

		expect(ordered).toEqual([]);

		// scroll container has still not scrolled
		expect(parentScrollContainer.scrollTop).toBe(initialScrollTop);

		// on the second frame we are performing our initial scroll
		// which will mark the first engagement
		// (and will also perform the first scroll)
		advanceTimersToNextFrame();
		stepScrollBy();

		// scroll container has now been scrolled
		expect(parentScrollContainer.scrollTop).toBeLessThan(initialScrollTop);

		// Complete the time dampening duration
		jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);

		// Triggering another frame
		// we are expecting the scroll change to be the maximum allowed
		{
			const before = parentScrollContainer.scrollTop;
			advanceTimersToNextFrame();
			stepScrollBy();
			const after = parentScrollContainer.scrollTop;
			expect(before - after).toBe(maxScrollPerFrame);
		}

		userEvent.drop(child);
		expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);
		ordered.length = 0;
	}

	// Let's do a few drag operations and ensure that the behaviour is the same

	dragOperation();
	dragOperation();
	dragOperation();
	dragOperation();

	cleanup();
});

it('should apply time dampening for window scrolling', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		autoScrollWindowForElements(),
		setElementFromPointToBe(element),
		bind(window, {
			type: 'scroll',
			listener(event) {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			options: { capture: true },
		}),
	);

	// setting a large vertical amount of available scroll
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const initialScrollTop = document.documentElement.scrollTop;
	const initialScrollLeft = document.documentElement.scrollLeft;
	expect(initialScrollTop).toBe(0);
	expect(initialScrollLeft).toBe(0);

	// starting a drag
	userEvent.lift(element);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// in the first frame before auto scrolling has started
	// we are updating our drag so that we are over
	fireEvent.dragEnter(document.body, {
		clientX: document.documentElement.clientLeft + document.documentElement.clientWidth / 2,
		clientY: document.documentElement.clientTop + document.documentElement.clientHeight,
	});
	expect(ordered).toEqual(['dropTarget:leave']);
	ordered.length = 0;

	// in the first frame, there will be no auto scroll
	advanceTimersToNextFrame();
	expect(ordered).toEqual([]);

	// checking window has not been scrolled
	expect(document.documentElement.scrollTop).toBe(initialScrollTop);

	let lastScrollTop = initialScrollTop;
	let lastScrollChange = 0;

	let engagementStart: number | null = null;

	// tracking the various cases to make sure we are actually hitting them
	const casesHit = {
		acceleration: false,
		'time-dampening-finished': false,
		'time-dampening-finished-last-scroll': false,
	};

	const maxScrollTop =
		document.documentElement.scrollHeight - document.documentElement.clientHeight;

	// Keep going until we cannot scroll any more
	while (document.documentElement.scrollTop <= maxScrollTop) {
		advanceTimersToNextFrame();
		stepScrollBy();

		// asserting that one scroll event has occurred
		expect(ordered).toEqual(['window:scroll']);
		ordered.length = 0;

		// Engagement not set until first active scroll
		if (!engagementStart) {
			engagementStart = Date.now();
		}

		const currentScrollTop = document.documentElement.scrollTop;
		const scrollChange = currentScrollTop - lastScrollTop;

		// we are scrolling forward so our change will be positive
		expect(scrollChange).toBeGreaterThan(0);

		lastScrollTop = currentScrollTop;

		const now = Date.now();
		const duration = now - engagementStart;

		// Case 1: in the time dampening period
		if (duration < defaultConfig.timeDampeningDurationMs) {
			// We are still not at the max scroll speed
			expect(scrollChange).not.toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);
			// Each scroll is bigger than the last
			expect(scrollChange).toBeGreaterThan(lastScrollChange);
			casesHit.acceleration = true;
			continue;
		}
		// Case 2: scrolling at max speed, but not finished scrolling
		// Expecting max scroll speed
		if (document.documentElement.scrollTop < maxScrollTop) {
			expect(scrollChange).toBe(defaultConfig.maxPixelScrollPerSecond / 60);
			casesHit['time-dampening-finished'] = true;
			continue;
		}
		// Case 3: the last scroll finished the scrolling of the element.
		// The last scroll could be slightly less than the max scroll amount
		// as there might not have been the max scroll amount left to scroll
		expect(scrollChange).toBeLessThanOrEqual(defaultConfig.maxPixelScrollPerSecond / 60);
		casesHit['time-dampening-finished-last-scroll'] = true;

		// We can finish here (even though the exit condition would catch us too)
		break;
	}

	// scroll container has been scrolled all the way to the top
	expect(document.documentElement.scrollTop).toBe(maxScrollTop);
	// asserting all our cases where hit
	expect(casesHit.acceleration).toBe(true);
	expect(casesHit['time-dampening-finished']).toBe(true);
	expect(casesHit['time-dampening-finished-last-scroll']).toBe(true);

	// scrollLeft should not have changed
	expect(document.documentElement.scrollLeft).toBe(initialScrollLeft);

	cleanup();
});
