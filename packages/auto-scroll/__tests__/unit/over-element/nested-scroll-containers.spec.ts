import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { type Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { autoScrollForElements } from '../../../src/entry-point/element';
import { isWithin } from '../../../src/shared/is-within'; // this internal util is helpful for what we are trying to do
import {
	advanceTimersToNextFrame,
	appendToBody,
	reset,
	setElementFromPoint,
	setStartSystemTime,
	setupNestedScrollContainers,
	stepScrollBy,
	userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers();
setStartSystemTime();

beforeEach(reset);

it('should scroll inner elements before outer elements [single axis]', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandparent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(grandParent),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('child:start'),
			onDrop: () => ordered.push('child:drop'),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => ordered.push('parent:start'),
			onDrop: () => ordered.push('parent:drop'),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => ordered.push('grandParent:start'),
			onDrop: () => ordered.push('grandParent:drop'),
		}),
		autoScrollForElements({
			element: parent,
		}),
		autoScrollForElements({
			element: grandParent,
		}),
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === grandParent) {
					ordered.push('grandParent:scroll');
					return;
				}
				if (event.target === parent) {
					// console.log('parent', parent.scrollTop, parent.scrollLeft);
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	// Set some initial scroll on the scroll containers
	// These are in the range where auto scrolling will occur on both
	parent.scrollTop = 60;
	grandParent.scrollTop = 120;

	// lifting the mid point of the top edge
	userEvent.lift(child, {
		clientX:
			grandParent.getBoundingClientRect().left + grandParent.getBoundingClientRect().width / 2,
		clientY: grandParent.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	{
		const hit = jest.fn();
		while (parent.scrollTop > 0) {
			hit();
			advanceTimersToNextFrame();
			stepScrollBy();
			expect(ordered).toEqual(['parent:scroll']);
			ordered.length = 0;
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	// Now it will scroll the grand parent until it's finished
	{
		const hit = jest.fn();
		while (grandParent.scrollTop > 0) {
			hit();
			advanceTimersToNextFrame();
			stepScrollBy();
			expect(ordered).toEqual(['grandParent:scroll']);
			ordered.length = 0;
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	cleanup();
});

it('should scroll inner elements before outer elements [both axis at a time]', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandParent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(grandParent),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('child:start'),
			onDrop: () => ordered.push('child:drop'),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => ordered.push('parent:start'),
			onDrop: () => ordered.push('parent:drop'),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => ordered.push('grandParent:start'),
			onDrop: () => ordered.push('grandParent:drop'),
		}),
		autoScrollForElements({
			element: parent,
		}),
		autoScrollForElements({
			element: grandParent,
		}),
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === grandParent) {
					ordered.push('grandParent:scroll');
					return;
				}
				if (event.target === parent) {
					// console.log('parent', parent.scrollTop, parent.scrollLeft);
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	// Set some initial scroll on the scroll containers
	parent.scrollTop = 60;
	parent.scrollLeft = 60;
	grandParent.scrollTop = 120;
	grandParent.scrollLeft = 120;

	// lifting the shared top left corner
	userEvent.lift(child, {
		clientX: grandParent.getBoundingClientRect().left,
		clientY: grandParent.getBoundingClientRect().top,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	{
		const hit = jest.fn();
		while (parent.scrollTop > 0) {
			hit();
			const before = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const after = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};

			// only the parent scrolled
			expect(ordered).toEqual(['parent:scroll']);
			ordered.length = 0;

			// asserting we scrolled in both directions
			expect(before.scrollTop).toBeGreaterThan(after.scrollTop);
			expect(before.scrollLeft).toBeGreaterThan(after.scrollLeft);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	// Now it will scroll the grand parent until it's finished
	{
		const hit = jest.fn();
		while (grandParent.scrollTop > 0) {
			hit();
			const before = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const after = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};

			// only the grandParent scrolled
			expect(ordered).toEqual(['grandParent:scroll']);
			ordered.length = 0;

			// asserting we scrolled in both directions
			expect(before.scrollTop).toBeGreaterThan(after.scrollTop);
			expect(before.scrollLeft).toBeGreaterThan(after.scrollLeft);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	cleanup();
});

it('should only scroll one scroll container per axis [case: inner is scrolling on vertical, parent on both]', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandparent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(grandParent),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('child:start'),
			onDrop: () => ordered.push('child:drop'),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => ordered.push('parent:start'),
			onDrop: () => ordered.push('parent:drop'),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => ordered.push('grandParent:start'),
			onDrop: () => ordered.push('grandParent:drop'),
		}),
		autoScrollForElements({
			element: parent,
		}),
		autoScrollForElements({
			element: grandParent,
		}),
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === grandParent) {
					ordered.push('grandParent:scroll');
					return;
				}
				if (event.target === parent) {
					// console.log('parent', parent.scrollTop, parent.scrollLeft);
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	// These values are more magic than I originally planned 😅
	// Small amount of scroll on the parent (should finish first)
	parent.scrollTop = 10;
	// → No available scroll on the left
	// Larger amount on the grand parent
	// (due to lift point this will accelerate faster than parent)
	grandParent.scrollTop = 80;
	grandParent.scrollLeft = 80;

	const client: Position = {
		x: grandParent.getBoundingClientRect().left,
		y: grandParent.getBoundingClientRect().top,
	};

	// validating setup
	expect(isWithin({ client, clientRect: parent.getBoundingClientRect() })).toBe(true);
	expect(isWithin({ client, clientRect: grandParent.getBoundingClientRect() })).toBe(true);

	// lifting the top left corner
	userEvent.lift(child, {
		clientX: client.x,
		clientY: client.y,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scroll the parent until it cannot scroll any more
	{
		const hit = jest.fn();
		while (parent.scrollTop > 0) {
			hit();
			const parentBefore = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};
			const grandParentBefore = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const parentAfter = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};
			const grandParentAfter = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};

			// we scroll inner most elements outwards (bubble ordering)
			expect(ordered).toEqual(['parent:scroll', 'grandParent:scroll']);
			ordered.length = 0;

			// parent scrolled on the top, but not on the left
			expect(parentBefore.scrollTop).toBeGreaterThan(parentAfter.scrollTop);
			expect(parentBefore.scrollLeft).toBe(parentAfter.scrollLeft);

			// grand parent not permitted to scroll on the top, but can scroll on left
			expect(grandParentBefore.scrollTop).toBe(grandParentAfter.scrollTop);
			expect(grandParentBefore.scrollLeft).toBeGreaterThan(grandParentAfter.scrollLeft);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	// finish off scrolling the grand parent
	{
		const hit = jest.fn();
		while (grandParent.scrollTop > 0 || grandParent.scrollLeft > 0) {
			hit();
			const grandParentBefore = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const grandParentAfter = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};

			// only the grandParent scrolled
			expect(ordered).toEqual(['grandParent:scroll']);
			ordered.length = 0;

			expect(grandParentBefore.scrollTop).toBeGreaterThan(grandParentAfter.scrollTop);

			// There was already some scroll on the left, so expecting left
			// will finish scrolling before the top
			expect(grandParentBefore.scrollLeft).toBeGreaterThanOrEqual(grandParentAfter.scrollLeft);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	cleanup();
});

it('should only scroll one scroll container per axis [case: inner is scrolling on horizontal, parent on both]', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandparent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(grandParent),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('child:start'),
			onDrop: () => ordered.push('child:drop'),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => ordered.push('parent:start'),
			onDrop: () => ordered.push('parent:drop'),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => ordered.push('grandParent:start'),
			onDrop: () => ordered.push('grandParent:drop'),
		}),
		autoScrollForElements({
			element: parent,
		}),
		autoScrollForElements({
			element: grandParent,
		}),
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === grandParent) {
					ordered.push('grandParent:scroll');
					return;
				}
				if (event.target === parent) {
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	// These values are more magic than I originally planned 😅
	// Small amount of scroll on the parent (should finish first)
	parent.scrollLeft = 10;
	// → No available scroll on the top
	// Larger amount on the grand parent
	// (due to lift point this will accelerate faster than parent)
	grandParent.scrollTop = 80;
	grandParent.scrollLeft = 80;

	const client: Position = {
		x: grandParent.getBoundingClientRect().left,
		y: grandParent.getBoundingClientRect().top,
	};

	// validating setup
	expect(isWithin({ client, clientRect: parent.getBoundingClientRect() })).toBe(true);
	expect(isWithin({ client, clientRect: grandParent.getBoundingClientRect() })).toBe(true);

	// lifting the top left corner
	userEvent.lift(child, {
		clientX: client.x,
		clientY: client.y,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scroll the parent until it cannot scroll any more
	{
		const hit = jest.fn();
		while (parent.scrollLeft > 0) {
			hit();
			const parentBefore = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};
			const grandParentBefore = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const parentAfter = {
				scrollTop: parent.scrollTop,
				scrollLeft: parent.scrollLeft,
			};
			const grandParentAfter = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};

			// we scroll inner most elements outwards (bubble ordering)
			expect(ordered).toEqual(['parent:scroll', 'grandParent:scroll']);
			ordered.length = 0;

			// parent scrolled on the left, but not on the top
			expect(parentBefore.scrollLeft).toBeGreaterThan(parentAfter.scrollLeft);
			expect(parentBefore.scrollTop).toBe(parentAfter.scrollTop);

			// grand parent not permitted to scroll on the left, but can scroll on top
			expect(grandParentBefore.scrollLeft).toBe(grandParentAfter.scrollLeft);
			expect(grandParentBefore.scrollTop).toBeGreaterThan(grandParentAfter.scrollTop);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	// finish off scrolling the grand parent
	{
		const hit = jest.fn();
		while (grandParent.scrollTop > 0 || grandParent.scrollLeft > 0) {
			hit();
			const grandParentBefore = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};
			advanceTimersToNextFrame();
			stepScrollBy();
			const grandParentAfter = {
				scrollTop: grandParent.scrollTop,
				scrollLeft: grandParent.scrollLeft,
			};

			// only the grandParent scrolled
			expect(ordered).toEqual(['grandParent:scroll']);
			ordered.length = 0;

			expect(grandParentBefore.scrollLeft).toBeGreaterThan(grandParentAfter.scrollLeft);

			// There was already some scroll on the top, so expecting top
			// will finish scrolling before the top
			expect(grandParentBefore.scrollTop).toBeGreaterThanOrEqual(grandParentAfter.scrollTop);
		}
		expect(hit.mock.calls.length).toBeGreaterThan(1);
	}

	cleanup();
});

it('should ignore scroll containers that have `canScroll: () => false` [case: inner is scrolling on horizontal, parent on both]', () => {
	const [child, parent, grandParent, greatGrandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 8000, height: 8000 },
		// grandparent,
		{ width: 5000, height: 5000 },
		// great grandparent,
		{ width: 2000, height: 2000 },
	]);

	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(greatGrandParent),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('child:start'),
			onDrop: () => ordered.push('child:drop'),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => ordered.push('parent:start'),
			onDrop: () => ordered.push('parent:drop'),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => ordered.push('grandParent:start'),
			onDrop: () => ordered.push('grandParent:drop'),
		}),
		dropTargetForElements({
			element: greatGrandParent,
			onDragStart: () => ordered.push('greatGrandParent:start'),
			onDrop: () => ordered.push('greatGrandParent:drop'),
		}),
		autoScrollForElements({
			element: parent,
		}),
		autoScrollForElements({
			element: grandParent,
			canScroll: () => false,
		}),
		autoScrollForElements({
			element: greatGrandParent,
		}),
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === greatGrandParent) {
					ordered.push('greatGrandParent:scroll');
					return;
				}

				if (event.target === grandParent) {
					ordered.push('grandParent:scroll');
					return;
				}
				if (event.target === parent) {
					// console.log('parent', parent.scrollTop, parent.scrollLeft);
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	parent.scrollLeft = 20;
	// no scroll available on the top side of the parent
	grandParent.scrollTop = 30;
	grandParent.scrollLeft = 30;
	greatGrandParent.scrollTop = 40;
	greatGrandParent.scrollLeft = 40;

	// lifting the top left corner
	userEvent.lift(child, {
		clientX: greatGrandParent.getBoundingClientRect().left,
		clientY: greatGrandParent.getBoundingClientRect().top,
	});

	expect(ordered).toEqual([
		'draggable:start',
		'child:start',
		'parent:start',
		'grandParent:start',
		'greatGrandParent:start',
	]);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scroll the parent until it cannot scroll any more

	const parentBefore = {
		scrollTop: parent.scrollTop,
		scrollLeft: parent.scrollLeft,
	};
	const grandParentBefore = {
		scrollTop: grandParent.scrollTop,
		scrollLeft: grandParent.scrollLeft,
	};
	const greatGrandParentBefore = {
		scrollTop: greatGrandParent.scrollTop,
		scrollLeft: greatGrandParent.scrollLeft,
	};
	advanceTimersToNextFrame();
	stepScrollBy();
	const parentAfter = {
		scrollTop: parent.scrollTop,
		scrollLeft: parent.scrollLeft,
	};
	const grandParentAfter = {
		scrollTop: grandParent.scrollTop,
		scrollLeft: grandParent.scrollLeft,
	};
	const greatGrandParentAfter = {
		scrollTop: greatGrandParent.scrollTop,
		scrollLeft: greatGrandParent.scrollLeft,
	};

	// we scroll inner most elements outwards (bubble ordering)
	// grandParent is disabled, so it will be skipped
	expect(ordered).toEqual(['parent:scroll', 'greatGrandParent:scroll']);
	ordered.length = 0;

	// parent scrolled on the left, but not on the top
	expect(parentBefore.scrollLeft).toBeGreaterThan(parentAfter.scrollLeft);
	expect(parentBefore.scrollTop).toBe(parentAfter.scrollTop);

	// no changes to grandParent as scrolling is disabled
	expect(grandParentBefore.scrollTop).toBe(grandParentAfter.scrollTop);
	expect(grandParentBefore.scrollLeft).toBe(grandParentAfter.scrollLeft);

	// great grand parent not permitted to scroll on the left, but can scroll on top
	expect(greatGrandParentBefore.scrollLeft).toBe(greatGrandParentAfter.scrollLeft);
	expect(greatGrandParentBefore.scrollTop).toBeGreaterThan(greatGrandParentAfter.scrollTop);

	cleanup();
});

// TODO: could also add similar tests for scrolling forward, but they are proving extremely difficult to setup well
