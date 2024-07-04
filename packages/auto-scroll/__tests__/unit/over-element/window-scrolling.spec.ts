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
import {
	advanceTimersToNextFrame,
	appendToBody,
	getBubbleOrderedTree,
	reset,
	setElementFromPoint,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers();
setStartSystemTime();

beforeEach(reset);

beforeEach(() => {
	document.documentElement.scrollTop = 0;
});

function canScrollOnBottom(element: HTMLElement): boolean {
	return Math.ceil(element.scrollTop) + element.clientHeight < element.scrollHeight;
}

test('validating initial properties are set by jsdom', () => {
	expect(document.documentElement.clientHeight).toBe(768);
	expect(document.documentElement.clientWidth).toBe(1024);
	expect(document.documentElement.clientTop).toBe(0);
	expect(document.documentElement.clientLeft).toBe(0);
	expect(document.documentElement.scrollTop).toBe(0);
	expect(document.documentElement.scrollLeft).toBe(0);
});

it('should scroll the window if it is scrollable', () => {
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
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		autoScrollWindowForElements(),
		setElementFromPoint(element),
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

	// next frame should scroll the window
	const before = document.documentElement.scrollTop;
	advanceTimersToNextFrame();
	stepScrollBy();
	const after = document.documentElement.scrollTop;
	expect(after).toBeGreaterThan(before);
	expect(ordered).toEqual(['window:scroll']);
	ordered.length = 0;

	cleanup();
});

it('should not warn if there are multiple registrations', () => {
	const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
	const cleanup = combine(
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),
	);

	expect(warn).not.toHaveBeenCalled();

	cleanup();
	warn.mockRestore();
});

it('should only scroll the window once, even if there are other registrations', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	// multiple registrations
	const unregister1 = autoScrollWindowForElements();
	const unregister2 = autoScrollWindowForElements();

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
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(element),
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

	// next frame should scroll the window
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBeGreaterThan(before);
		expect(ordered).toEqual(['window:scroll']);
		ordered.length = 0;
	}
	// removing one registration, scroll should still occur
	unregister1();
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBeGreaterThan(before);
		expect(ordered).toEqual(['window:scroll']);
		ordered.length = 0;
	}

	// removing final registration, scroll should not occur
	unregister2();
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBe(before);
		expect(ordered).toEqual([]);
		ordered.length = 0;
	}

	cleanup();
});

it('should only scroll the window if there are any registrations that have canScroll: () => true', () => {
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
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		autoScrollWindowForElements({
			canScroll: () => {
				ordered.push('1. canScroll: false');
				return false;
			},
		}),
		autoScrollWindowForElements({
			canScroll: () => {
				ordered.push('2. canScroll: true');
				return true;
			},
		}),
		autoScrollWindowForElements({
			canScroll: () => {
				ordered.push('3. canScroll: false');
				return false;
			},
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(element),
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

	// next frame should scroll the window
	{
		const before = document.documentElement.scrollTop;
		advanceTimersToNextFrame();
		stepScrollBy();
		const after = document.documentElement.scrollTop;
		expect(after).toBeGreaterThan(before);
		expect(ordered).toEqual([
			'1. canScroll: false',
			'2. canScroll: true',
			// '3. canScroll: false' should not be called as it was not needed
			'window:scroll',
		]);
		ordered.length = 0;
	}

	cleanup();
});

it('should not scroll the window if there are no active registrations', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	let unregisterAutoScrolling = autoScrollWindowForElements();

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
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(element),
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

	// next frame should scroll the window
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['window:scroll']);
	ordered.length = 0;

	// now un registering our auto scroll
	unregisterAutoScrolling();

	// an auto scroll on the window should not occur in the next frame
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// enabling auto scrolling again
	unregisterAutoScrolling = autoScrollWindowForElements();

	// an auto scroll should occur in the next frame
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['window:scroll']);

	unregisterAutoScrolling();
	cleanup();
});

it('should not scroll the window if no registrations are allowing scrolling', () => {
	const [element] = getBubbleOrderedTree();
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});
	let allowScrolling: boolean = true;

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		autoScrollWindowForElements({
			canScroll: () => allowScrolling,
		}),
		autoScrollWindowForElements({
			canScroll: () => allowScrolling,
		}),
		autoScrollWindowForElements({
			canScroll: () => allowScrolling,
		}),

		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(element),
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

	// next frame should scroll the window
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['window:scroll']);
	ordered.length = 0;

	// now un registering our auto scroll
	allowScrolling = false;

	// an auto scroll on the window should not occur in the next frame
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// scrolling allowed again
	allowScrolling = true;

	// we should now expect to see auto scrolling enabled again
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['window:scroll']);

	cleanup();
});

it('should scroll the window once, even if there are multiple registrations', () => {
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
		// multiple registrations - only one allowing scrolling
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),
		autoScrollWindowForElements(),

		appendToBody(element),
		draggable({
			element: element,
			onDragStart: () => ordered.push('draggable:start'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: element,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(element),
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

	userEvent.lift(element, {
		clientX: document.documentElement.clientLeft + document.documentElement.clientWidth / 2,
		clientY: document.documentElement.clientTop + document.documentElement.clientHeight,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	// next frame should scroll the window
	const before = document.documentElement.scrollTop;
	advanceTimersToNextFrame();
	stepScrollBy();
	const after = document.documentElement.scrollTop;
	expect(after).toBeGreaterThan(before);
	expect(ordered).toEqual(['window:scroll']);
	ordered.length = 0;

	cleanup();
});

it('should scroll a scroll container before the window', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer({
		child: {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight * 20,
		},
		scrollContainer: {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
		},
	});
	const ordered: string[] = [];

	// Setting some large scroll height on the window
	Object.defineProperties(document.documentElement, {
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const cleanup = combine(
		autoScrollWindowForElements(),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
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
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				if (event.target === parentScrollContainer) {
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

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

	// scroll the scroll parent until it is finished
	// (window should not be scrolled yet)
	{
		const hit = jest.fn();
		while (canScrollOnBottom(parentScrollContainer)) {
			hit();
			advanceTimersToNextFrame();
			stepScrollBy();
			expect(ordered).toEqual(['parent:scroll']);
			ordered.length = 0;
		}
		expect(hit).toHaveBeenCalled();
	}

	// window should now scroll
	{
		const hit = jest.fn();
		while (canScrollOnBottom(document.documentElement)) {
			hit();
			advanceTimersToNextFrame();
			stepScrollBy();
			expect(ordered).toEqual(['window:scroll']);
			ordered.length = 0;
		}
		expect(hit).toHaveBeenCalled();
	}

	// asserting there is nothing left to scroll
	advanceTimersToNextFrame();
	stepScrollBy();
	expect(ordered).toEqual([]);

	cleanup();
});

it('should not scroll the window if a scroll container absorbed all the scroll axis', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer({
		child: {
			// won't be scrolling the scroll parent on the horizontal axis
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight * 20,
		},
		scrollContainer: {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
		},
	});
	const ordered: string[] = [];

	// Setting some large scroll width and height on the window
	Object.defineProperties(document.documentElement, {
		scrollWidth: {
			value: document.documentElement.clientWidth * 10,
			writable: false,
		},
		scrollHeight: {
			value: document.documentElement.clientHeight * 10,
			writable: false,
		},
	});

	const cleanup = combine(
		autoScrollWindowForElements(),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
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
		setElementFromPoint(child),
		bind(window, {
			type: 'scroll',
			listener: (event) => {
				if (event.target === document.documentElement) {
					ordered.push('window:scroll');
					return;
				}
				if (event.target === parentScrollContainer) {
					ordered.push('parent:scroll');
					return;
				}
				ordered.push('unknown:scroll');
			},
			// scroll events do not bubble, so leveraging the capture phase
			options: { capture: true },
		}),
	);

	// lifting on bottom right
	// expecting to scroll vertically on the scroll container
	// and horizontally on the window
	userEvent.lift(child, {
		clientX: parentScrollContainer.getBoundingClientRect().right,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();

	expect(ordered).toEqual([]);

	const parentBefore = {
		scrollTop: parentScrollContainer.scrollTop,
		scrollLeft: parentScrollContainer.scrollLeft,
	};
	const windowBefore = {
		scrollTop: document.documentElement.scrollTop,
		scrollLeft: document.documentElement.scrollLeft,
	};
	advanceTimersToNextFrame();
	stepScrollBy();
	const parentAfter = {
		scrollTop: parentScrollContainer.scrollTop,
		scrollLeft: parentScrollContainer.scrollLeft,
	};
	const windowAfter = {
		scrollTop: document.documentElement.scrollTop,
		scrollLeft: document.documentElement.scrollLeft,
	};
	expect(ordered).toEqual(['parent:scroll', 'window:scroll']);
	ordered.length = 0;

	// expecting vertical scroll on the scroll container,
	// and because the scroll container cannot scroll horizontally,
	// we should see some horizontal scrolling on the window
	expect(parentAfter.scrollTop).toBeGreaterThan(parentBefore.scrollTop);
	expect(parentAfter.scrollLeft).toBe(parentBefore.scrollLeft);
	expect(windowAfter.scrollLeft).toBeGreaterThan(windowBefore.scrollLeft);
	expect(windowAfter.scrollTop).toBe(windowBefore.scrollTop);

	cleanup();
});
