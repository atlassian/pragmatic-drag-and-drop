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

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers();
setStartSystemTime();

beforeEach(reset);

it('should not scroll scrollable elements that are not registered', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();
	const ordered: string[] = [];

	// not marking outerScrollContainer as a scroll container
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
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// setting an initial scroll
	parentScrollContainer.scrollTop = 500;

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

	// on second frame - there would be a scroll is there was a registered scroll container
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	cleanup();
});

it('should not scroll scrollable elements that are no longer registered', () => {
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
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);
	const unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});

	// setting an initial scroll
	parentScrollContainer.scrollTop = 500;

	// top center of scroll container
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

	// on second frame we will get a scroll
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	// we will no longer get scroll updates after unregistered
	unbindAutoScrolling();

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);

	cleanup();
});

it('should scroll scrollable elements are registered mid drag', () => {
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
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		setElementFromPoint(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push(`scroll event`);
			},
		}),
	);

	// setting an initial scroll
	parentScrollContainer.scrollTop = 500;

	// top center of scroll container
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

	// on second frame there is no scroll
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual([]);
	ordered.length = 0;

	// there will be a registration for the third frame, so we will get a scroll
	const unbindAutoScrolling = autoScrollForElements({
		element: parentScrollContainer,
	});
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(ordered).toEqual(['scroll event']);

	unbindAutoScrolling();
	cleanup();
});

it('should warn if an elements is registered but are not scrollable', () => {
	const { child } = setupBasicScrollContainer();
	const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

	const cleanup = autoScrollForElements({
		element: child,
	});

	expect(warn).toHaveBeenCalled();

	cleanup();
	warn.mockRestore();
});

it('should log a warning if an existing registration exists for an element', () => {
	const { parentScrollContainer } = setupBasicScrollContainer();
	const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

	const cleanup1 = autoScrollForElements({
		element: parentScrollContainer,
	});

	expect(warn).not.toHaveBeenCalled();

	const cleanup2 = autoScrollForElements({
		element: parentScrollContainer,
	});

	expect(warn).toHaveBeenCalled();

	cleanup1();
	cleanup2();
	warn.mockRestore();
});
