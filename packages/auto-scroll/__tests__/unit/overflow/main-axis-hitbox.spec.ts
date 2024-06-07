import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import { type Axis, type Edge, type Side } from '../../../src/internal-types';
import { isWithin } from '../../../src/shared/is-within';
import { mainAxisSideLookup } from '../../../src/shared/side';
import {
	advanceTimersToNextFrame,
	appendToBody,
	getInsidePoints,
	getOutsidePoints,
	getRect,
	mainAxisForSide,
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

const { child, parentScrollContainer } = setupBasicScrollContainer();

beforeEach(() => {
	// setting some initial scroll so the element
	// can be scrolled in any direction
	parentScrollContainer.scrollTop = 10;
	parentScrollContainer.scrollLeft = 10;
});

type Scenario = {
	edge: Edge;
	hitbox: DOMRect;
};

const overflowSizeOnMainAxis: number = 100;

const overflow: Required<
	ReturnType<Parameters<typeof unsafeOverflowAutoScrollForElements>[0]['getOverflow']>
> = {
	fromBottomEdge: {
		right: 0,
		left: 0,
		bottom: overflowSizeOnMainAxis,
	},
	fromTopEdge: {
		right: 0,
		left: 0,
		top: overflowSizeOnMainAxis,
	},
	fromRightEdge: {
		right: overflowSizeOnMainAxis,
		top: 0,
		bottom: 0,
	},
	fromLeftEdge: {
		left: overflowSizeOnMainAxis,
		top: 0,
		bottom: 0,
	},
};

const parentRect: DOMRect = parentScrollContainer.getBoundingClientRect();

const scenarios: Scenario[] = [
	{
		edge: 'top',
		hitbox: getRect({
			top: parentRect.top - overflowSizeOnMainAxis,
			right: parentRect.right,
			// (the first pixel is "cut out" by the "over element" auto scroller)
			// bottom: parentRect.top,
			bottom: parentRect.top - 1,
			left: parentRect.left,
		}),
	},
	{
		edge: 'bottom',
		hitbox: getRect({
			// (the first pixel is "cut out" by the "over element" auto scroller)
			top: parentRect.bottom + 1,
			right: parentRect.right,
			bottom: parentRect.bottom + overflowSizeOnMainAxis,
			left: parentRect.left,
		}),
	},
	{
		edge: 'left',
		hitbox: getRect({
			top: parentRect.top,
			// (the first pixel is "cut out" by the "over element" auto scroller)
			right: parentRect.left - 1,
			bottom: parentRect.bottom,
			left: parentRect.left - overflowSizeOnMainAxis,
		}),
	},
	{
		edge: 'right',
		hitbox: getRect({
			top: parentRect.top,
			right: parentRect.right + overflowSizeOnMainAxis,
			bottom: parentRect.bottom,
			// (the first pixel is "cut out" by the "over element" auto scroller)
			left: parentRect.right + 1,
		}),
	},
];

scenarios.forEach((scenario) => {
	const axis: Axis = mainAxisForSide[scenario.edge];
	const side: Side = mainAxisSideLookup[scenario.edge];

	const mainAxisScrollProperty = axis === 'vertical' ? 'scrollTop' : 'scrollLeft';
	const crossAxisScrollProperty =
		mainAxisScrollProperty === 'scrollTop' ? 'scrollLeft' : 'scrollTop';

	describe(`Scenario edge: ${scenario.edge}`, () => {
		getInsidePoints(scenario.hitbox).forEach((point) => {
			it(`should scroll when in the main axis overflow. Point: [${point.label}]`, () => {
				const ordered: string[] = [];

				const cleanup = combine(
					appendToBody(parentScrollContainer),
					draggable({
						element: child,
						onDragStart: () => ordered.push('draggable:start'),
						onDrop: () => ordered.push('draggable:drop'),
					}),
					dropTargetForElements({
						element: parentScrollContainer,
						onDragStart: () => ordered.push('dropTarget:start'),
						onDragEnter: () => ordered.push('dropTarget:enter'),
						onDragLeave: () => ordered.push('dropTarget:leave'),
						onDrop: () => ordered.push('dropTarget:drop'),
					}),
					unsafeOverflowAutoScrollForElements({
						element: parentScrollContainer,
						getOverflow: () => overflow,
					}),
					bind(parentScrollContainer, {
						type: 'scroll',
						listener: () => ordered.push(`scroll event`),
					}),
				);
				let unsetElementFromPoint = setElementFromPointToBe(child);

				// lifting in middle of element, should not trigger auto scrolling
				userEvent.lift(child, {
					clientX: parentRect.left + parentRect.width / 2,
					clientY: parentRect.top + parentRect.height / 2,
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

				// updating where we are to trigger auto scrolling
				// we will now be outside the drop target
				unsetElementFromPoint();
				unsetElementFromPoint = setElementFromPointToBe(document.body);
				fireEvent.dragEnter(document.body, {
					clientX: point.x,
					clientY: point.y,
				});

				expect(ordered).toEqual(['dropTarget:leave']);
				ordered.length = 0;

				// the drop target changed will be picked up in the next frame
				const before = {
					scrollTop: parentScrollContainer.scrollTop,
					scrollLeft: parentScrollContainer.scrollLeft,
				};
				advanceTimersToNextFrame();
				stepScrollBy();
				const after = {
					scrollTop: parentScrollContainer.scrollTop,
					scrollLeft: parentScrollContainer.scrollLeft,
				};

				// scrolling forward when on the "end" edge
				if (side === 'end') {
					expect(after[mainAxisScrollProperty]).toBeGreaterThan(before[mainAxisScrollProperty]);
					// Should be scrolling backwards on the "start" edge
				} else {
					expect(after[mainAxisScrollProperty]).toBeLessThan(before[mainAxisScrollProperty]);
				}
				// scroll axis should not have been scrolled
				expect(before[crossAxisScrollProperty]).toBe(after[crossAxisScrollProperty]);
				// only a single scroll event occurred
				expect(ordered).toEqual(['scroll event']);

				cleanup();
			});
		});

		// need to exclude points that would be over the main parent rect and would usually
		// be excluded by our `elementFromPoint()` check.
		const relevantOutsidePoints = getOutsidePoints(scenario.hitbox).filter((point) => {
			const isOverParent = isWithin({
				client: point,
				clientRect: parentRect,
			});
			return !isOverParent;
		});
		invariant(relevantOutsidePoints.length > 1);

		relevantOutsidePoints.forEach((point) => {
			it(`should not scroll when outside the main axis overflow. Point: [${point.label}]`, () => {
				const ordered: string[] = [];

				const cleanup = combine(
					appendToBody(parentScrollContainer),
					draggable({
						element: child,
						onDragStart: () => ordered.push('draggable:start'),
						onDrop: () => ordered.push('draggable:drop'),
					}),
					dropTargetForElements({
						element: parentScrollContainer,
						onDragStart: () => ordered.push('dropTarget:start'),
						onDragEnter: () => ordered.push('dropTarget:enter'),
						onDragLeave: () => ordered.push('dropTarget:leave'),
						onDrop: () => ordered.push('dropTarget:drop'),
					}),
					unsafeOverflowAutoScrollForElements({
						element: parentScrollContainer,
						getOverflow: () => overflow,
					}),
					bind(parentScrollContainer, {
						type: 'scroll',
						listener: () => ordered.push(`scroll event`),
					}),
				);
				let unsetElementFromPoint = setElementFromPointToBe(child);

				// lifting in middle of element, should not trigger auto scrolling
				userEvent.lift(child, {
					clientX: parentRect.left + parentRect.width / 2,
					clientY: parentRect.top + parentRect.height / 2,
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

				// updating where we are to trigger auto scrolling
				// we will now be outside the drop target
				unsetElementFromPoint();
				unsetElementFromPoint = setElementFromPointToBe(document.body);
				fireEvent.dragEnter(document.body, {
					clientX: point.x,
					clientY: point.y,
				});

				expect(ordered).toEqual(['dropTarget:leave']);
				ordered.length = 0;

				// the drop target changed will be picked up in the next frame
				// we are expecting no scroll to have occurred
				advanceTimersToNextFrame();
				stepScrollBy();
				expect(ordered).toEqual([]);

				cleanup();
			});
		});
	});
});
