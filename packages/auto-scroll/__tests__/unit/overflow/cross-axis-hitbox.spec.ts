import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import { type Axis, type Edge, type Side } from '../../../src/internal-types';
import { axisLookup } from '../../../src/shared/axis';
import { getInternalConfig } from '../../../src/shared/configuration';
import { getOverElementHitbox } from '../../../src/shared/get-over-element-hitbox';
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
const defaultConfig = getInternalConfig();

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
const overflowSizeOnEachSideOfCrossAxis: number = 200;

const overflow: Required<
	ReturnType<Parameters<typeof unsafeOverflowAutoScrollForElements>[0]['getOverflow']>
> = {
	fromBottomEdge: {
		right: overflowSizeOnEachSideOfCrossAxis,
		left: overflowSizeOnEachSideOfCrossAxis,
		bottom: overflowSizeOnMainAxis,
	},
	fromTopEdge: {
		right: overflowSizeOnEachSideOfCrossAxis,
		left: overflowSizeOnEachSideOfCrossAxis,
		top: overflowSizeOnMainAxis,
	},
	fromRightEdge: {
		right: overflowSizeOnMainAxis,
		top: overflowSizeOnEachSideOfCrossAxis,
		bottom: overflowSizeOnEachSideOfCrossAxis,
	},
	fromLeftEdge: {
		left: overflowSizeOnMainAxis,
		top: overflowSizeOnEachSideOfCrossAxis,
		bottom: overflowSizeOnEachSideOfCrossAxis,
	},
};

const parentRect: DOMRect = parentScrollContainer.getBoundingClientRect();

function getOverElementMainHitboxSize(edge: Edge) {
	const overElementHitbox = getOverElementHitbox[edge]({
		clientRect: parentRect,
		config: defaultConfig,
	});
	const axis: Axis = mainAxisForSide[edge];
	const { mainAxis } = axisLookup[axis];
	return overElementHitbox[mainAxis.size];
}

const scenarios: Scenario[] = [
	{
		edge: 'top',
		hitbox: getRect({
			// Main axis
			top: parentRect.top - overflowSizeOnMainAxis,
			// pushing down into the element
			bottom: parentRect.top + getOverElementMainHitboxSize('top'),

			// Cross axis
			right: parentRect.right + overflowSizeOnEachSideOfCrossAxis,
			left: parentRect.left - overflowSizeOnEachSideOfCrossAxis,
		}),
	},
	{
		edge: 'bottom',
		hitbox: getRect({
			// Main axis
			bottom: parentRect.bottom + overflowSizeOnMainAxis,
			// pulling up into the element
			top: parentRect.bottom - getOverElementMainHitboxSize('bottom'),

			// Cross axis
			right: parentRect.right + overflowSizeOnEachSideOfCrossAxis,
			left: parentRect.left - overflowSizeOnEachSideOfCrossAxis,
		}),
	},
	{
		edge: 'left',
		hitbox: getRect({
			// main axis
			left: parentRect.left - overflowSizeOnMainAxis,
			// push into the element
			right: parentRect.left + getOverElementMainHitboxSize('left'),

			// cross axis
			top: parentRect.top - overflowSizeOnEachSideOfCrossAxis,
			bottom: parentRect.bottom + overflowSizeOnEachSideOfCrossAxis,
		}),
	},
	{
		edge: 'right',
		hitbox: getRect({
			// main axis
			right: parentRect.right + overflowSizeOnMainAxis,
			// pull back into the element
			left: parentRect.right - getOverElementMainHitboxSize('right'),
			// cross axis
			top: parentRect.top - overflowSizeOnEachSideOfCrossAxis,
			bottom: parentRect.bottom + overflowSizeOnEachSideOfCrossAxis,
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
		getInsidePoints(scenario.hitbox)
			// We don't want to include the 'center' as that could be
			// over the element, which would not trigger an overflow scroll
			.filter((point) => point.label !== 'center')
			.forEach((point) => {
				it(`should scroll the main axis when in the cross axis hitbox for that edge. Point: [${point.label}]`, () => {
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
					// only a single scroll event occurred
					expect(ordered).toEqual(['scroll event']);

					// scrolling forward when on the "end" edge
					if (side === 'end') {
						expect(after[mainAxisScrollProperty]).toBeGreaterThan(before[mainAxisScrollProperty]);
						// Should be scrolling backwards on the "start" edge
					} else {
						expect(after[mainAxisScrollProperty]).toBeLessThan(before[mainAxisScrollProperty]);
					}
					// scroll axis should not have been scrolled
					expect(before[crossAxisScrollProperty]).toBe(after[crossAxisScrollProperty]);

					cleanup();
				});
			});

		getOutsidePoints(scenario.hitbox).forEach((point) => {
			it(`should not scroll the main axis when outside cross axis overflow for that edge. Point: [${point.label}]`, () => {
				const ordered: string[] = [];

				const fromEdge: ReturnType<
					Parameters<typeof unsafeOverflowAutoScrollForElements>[0]['getOverflow']
				> = (() => {
					if (scenario.edge === 'top') {
						return { fromTopEdge: overflow.fromTopEdge };
					}
					if (scenario.edge === 'bottom') {
						return { fromBottomEdge: overflow.fromBottomEdge };
					}
					if (scenario.edge === 'left') {
						return { fromLeftEdge: overflow.fromLeftEdge };
					}
					if (scenario.edge === 'right') {
						return { fromRightEdge: overflow.fromRightEdge };
					}
					throw Error('unhandled');
				})();

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
						getOverflow: () => fromEdge,
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
