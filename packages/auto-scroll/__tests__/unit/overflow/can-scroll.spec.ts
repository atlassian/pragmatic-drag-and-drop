import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import {
	advanceTimersToNextFrame,
	appendToBody,
	reset,
	setElementFromPointToBe,
	setStartSystemTime,
	setupBasicScrollContainer,
	setupNestedScrollContainers,
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
		unsafeOverflowAutoScrollForElements({
			element: parentScrollContainer,
			canScroll: () => isAutoScrollingAllowed,
			getOverflow: () => ({
				fromBottomEdge: {
					left: 0,
					right: 0,
					bottom: 100,
				},
			}),
		}),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener: () => ordered.push('scroll event'),
		}),
	);
	let unsetElementFromPoint = setElementFromPointToBe(child);

	// Scroll container is now looking over the center of the element
	parentScrollContainer.scrollTop = 500;
	parentScrollContainer.scrollLeft = 500;

	// lifting on mid point
	// This will not cause auto scrolling as we have not setup the "over element" auto scroller
	userEvent.lift(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width,
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
	stepScrollBy();

	expect(ordered).toEqual([]);

	// Second frame: no auto scroll will occur as we have not registered "over element" overflow scrolling
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);
	ordered.length = 0;

	fireEvent.dragOver(document.body, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width,
		clientY: parentScrollContainer.getBoundingClientRect().bottom + 1,
	});
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(document.body);

	// expecting overflow auto scroll in next frame
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	isAutoScrollingAllowed = false;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// re-enabling
	isAutoScrollingAllowed = true;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event']);

	cleanup();
});

it('should allow earlier registrations to scroll when a later registration has canScroll: () => false', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandparent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];
	let isParentScrollingAllowed: boolean = true;

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
		// Important for this test: grandParent is registered before parent
		// We are checking that blocking scrolling on `parent` does not stop `grandParent`
		// from scrolling.
		unsafeOverflowAutoScrollForElements({
			element: grandParent,
			getOverflow: () => ({
				fromTopEdge: {
					left: 0,
					right: 0,
					top: 100,
				},
			}),
		}),
		unsafeOverflowAutoScrollForElements({
			element: parent,
			canScroll: () => isParentScrollingAllowed,
			getOverflow: () => ({
				fromTopEdge: {
					left: 0,
					right: 0,
					top: 100,
				},
			}),
		}),
		setElementFromPointToBe(child),
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
	let unsetElementFromPoint = setElementFromPointToBe(child);

	// Set some initial scroll on the scroll containers
	// These are in the range where auto scrolling will occur on both
	parent.scrollTop = 60;
	grandParent.scrollTop = 120;

	// lifting the mid point
	userEvent.lift(child, {
		clientX:
			grandParent.getBoundingClientRect().left + grandParent.getBoundingClientRect().width / 2,
		clientY:
			grandParent.getBoundingClientRect().top + grandParent.getBoundingClientRect().height / 2,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// on second frame there will be no auto scrolling as we have not set up "over element"
	// auto scrolling
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	fireEvent.dragOver(document.body, {
		clientX: grandParent.getBoundingClientRect().left + grandParent.getBoundingClientRect().width,
		clientY: grandParent.getBoundingClientRect().top - 1,
	});
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(document.body);

	// expecting to now scroll both
	advanceTimersToNextFrame();
	stepScrollBy();

	// grand parent will scroll first as it was registered first
	expect(ordered).toEqual(['grandParent:scroll', 'parent:scroll']);
	ordered.length = 0;

	isParentScrollingAllowed = false;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['grandParent:scroll']);

	cleanup();
});

it('should allow later registrations to scroll when an earlier registration has canScroll: () => false', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		// child
		{ width: 10000, height: 10000 },
		// parent
		{ width: 5000, height: 5000 },
		// grandparent,
		{ width: 1000, height: 1000 },
	]);

	const ordered: string[] = [];
	let isParentScrollingAllowed: boolean = true;

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
		// Important for this test: `parent` is registered before `grandParent`.
		// We are validating that blocking scrolling on `parent` should not stop
		// the scrolling of `grandParent`.
		unsafeOverflowAutoScrollForElements({
			element: parent,
			canScroll: () => isParentScrollingAllowed,
			getOverflow: () => ({
				fromTopEdge: {
					left: 0,
					right: 0,
					top: 100,
				},
			}),
		}),
		unsafeOverflowAutoScrollForElements({
			element: grandParent,
			getOverflow: () => ({
				fromTopEdge: {
					left: 0,
					right: 0,
					top: 100,
				},
			}),
		}),
		setElementFromPointToBe(child),
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
	let unsetElementFromPoint = setElementFromPointToBe(child);

	// Set some initial scroll on the scroll containers
	// These are in the range where auto scrolling will occur on both
	parent.scrollTop = 60;
	grandParent.scrollTop = 120;

	// lifting the mid point
	userEvent.lift(child, {
		clientX:
			grandParent.getBoundingClientRect().left + grandParent.getBoundingClientRect().width / 2,
		clientY:
			grandParent.getBoundingClientRect().top + grandParent.getBoundingClientRect().height / 2,
	});

	expect(ordered).toEqual(['draggable:start', 'child:start', 'parent:start', 'grandParent:start']);
	ordered.length = 0;

	// on first frame, there is no auto scroll as
	// we don't know what the scroll speed should be until
	// a single frame has passed
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	// on second frame there will be no auto scrolling as we have not set up "over element"
	// auto scrolling
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	fireEvent.dragOver(document.body, {
		clientX: grandParent.getBoundingClientRect().left + grandParent.getBoundingClientRect().width,
		clientY: grandParent.getBoundingClientRect().top - 1,
	});
	unsetElementFromPoint();
	unsetElementFromPoint = setElementFromPointToBe(document.body);

	// expecting to now scroll both
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['parent:scroll', 'grandParent:scroll']);
	ordered.length = 0;

	isParentScrollingAllowed = false;

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['grandParent:scroll']);

	cleanup();
});
