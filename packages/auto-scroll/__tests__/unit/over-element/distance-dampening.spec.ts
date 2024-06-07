import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { autoScrollForElements } from '../../../src/entry-point/element';
import { type Axis, type Side } from '../../../src/internal-types';
import { axisLookup } from '../../../src/shared/axis';
import { getInternalConfig } from '../../../src/shared/configuration';
import {
	advanceTimersToNextFrame,
	appendToBody,
	reset,
	setElementFromPointToBe,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	tryGetRect,
	userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

const defaultConfig = getInternalConfig();
const maxScrollPerFrame = defaultConfig.maxPixelScrollPerSecond / 60;

type Scenario = {
	side: Side;
	axis: Axis;
};

const scenarios: Scenario[] = [
	{
		axis: 'vertical',
		side: 'start',
	},
	{
		axis: 'vertical',
		side: 'end',
	},
	{
		axis: 'horizontal',
		side: 'start',
	},
	{
		axis: 'horizontal',
		side: 'end',
	},
];

scenarios.forEach(({ axis, side }) => {
	const scrollProperty = axis === 'vertical' ? 'scrollTop' : 'scrollLeft';
	const mainAxisClientPoint = axis === 'vertical' ? 'clientY' : 'clientX';
	const crossAxisClientPoint = mainAxisClientPoint === 'clientY' ? 'clientX' : 'clientY';

	const { mainAxis, crossAxis } = axisLookup[axis];

	it(`should dampen acceleration based on the distance away from an edge [axis: ${axis}, side: ${side}]`, () => {
		const { parentScrollContainer, child } = setupBasicScrollContainer({
			scrollContainer: { width: 1000, height: 1000 },
			// giving us enough room to slowly move down through the hitbox
			child: { width: 20000, height: 20000 },
		});
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
				listener() {
					ordered.push(`scroll event`);
				},
			}),
		);

		// setting initial scroll
		parentScrollContainer[scrollProperty] = child.getBoundingClientRect()[mainAxis.size] / 2;

		const parentRect = parentScrollContainer.getBoundingClientRect();

		userEvent.lift(child, {
			// start or end point on main axis
			[mainAxisClientPoint]: parentRect[mainAxis[side]],
			// half way point
			[crossAxisClientPoint]: parentRect[crossAxis.start] + parentRect[crossAxis.size] / 2,
		});

		expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
		ordered.length = 0;

		// on first frame, there is no auto scroll as
		// we don't know what the scroll speed should be until
		// a single frame has passed
		advanceTimersToNextFrame();

		expect(ordered).toEqual([]);

		// on second frame we get our first auto scroll
		{
			const before = parentScrollContainer[scrollProperty];
			advanceTimersToNextFrame();
			stepScrollBy();
			const after = parentScrollContainer[scrollProperty];
			// end side = scroll amount will increase
			// start side = scroll amount will decrease
			expect(after - before).toBe(side === 'end' ? 1 : -1);
		}

		// fast forward so there is no more time dampening
		jest.advanceTimersByTime(defaultConfig.timeDampeningDurationMs);
		ordered.length = 0;

		// now expecting to be moving at the maximum speed
		const maxScrollInDirection = side === 'end' ? maxScrollPerFrame : -maxScrollPerFrame;
		{
			const before = parentScrollContainer[scrollProperty];
			advanceTimersToNextFrame();
			stepScrollBy();
			const after = parentScrollContainer[scrollProperty];

			// end side = scroll amount will increase
			// start side = scroll amount will decrease
			expect(after - before).toBe(maxScrollInDirection);
		}

		// Okay, we now know that the time dampening is finished
		// Let's start our actual test! 😅

		const autoScrollHitbox = tryGetRect({
			[crossAxis.start]: parentRect[crossAxis.start],
			[crossAxis.end]: parentRect[crossAxis.end],
			[mainAxis.start]:
				side === 'start'
					? parentRect[mainAxis.start]
					: parentRect[mainAxis.end] - defaultConfig.maxMainAxisHitboxSize,
			[mainAxis.end]:
				side === 'start'
					? parentRect[mainAxis.start] + defaultConfig.maxMainAxisHitboxSize
					: parentRect[mainAxis.end],
		});

		// 1. scroll up to the `startHitboxAtPercentageRemainingOfElement`
		// - expect scroll to get bigger as we get closer to edge

		const maxSpeedBuffer =
			autoScrollHitbox[mainAxis.size] *
			defaultConfig.maxScrollAtPercentageRemainingOfHitbox[mainAxis[side]];

		// we are currently at the max scroll speed
		let previousChange = maxScrollInDirection;

		// side: 'start' → moving from the end of the hitbox upwards
		// side: 'end' → moving from the start of the hitbox downwards
		let currentMainAxisClientPoint =
			side === 'start' ? autoScrollHitbox[mainAxis.end] : autoScrollHitbox[mainAxis.start];

		const casesHit = {
			first: false,
			accelerating: [] as number[],
			inMaxSpeedBuffer: false,
		};

		// Move through the hitbox
		// side: 'start' → moving from the end of the hitbox upwards
		// side: 'end' → moving from the start of the hitbox downwards
		while (
			side === 'start'
				? autoScrollHitbox[mainAxis.start] <= currentMainAxisClientPoint
				: currentMainAxisClientPoint <= autoScrollHitbox[mainAxis.end]
		) {
			fireEvent.dragOver(child, {
				[mainAxisClientPoint]: currentMainAxisClientPoint,
				[crossAxisClientPoint]: parentRect[crossAxis.start] + parentRect[crossAxis.size] / 2,
			});

			// the new drag location will not be picked up until the second frame
			// after a user input change.
			// frame 1: dragOver is throttled
			{
				const before = parentScrollContainer[scrollProperty];
				advanceTimersToNextFrame();
				stepScrollBy();
				const after = parentScrollContainer[scrollProperty];

				const diff = after - before;
				// diff has not changed as we are still using the old input for this frame
				expect(previousChange).toBe(diff);
			}

			// second frame: a scroll should occur based on the updated input
			{
				const before = parentScrollContainer[scrollProperty];
				advanceTimersToNextFrame();
				stepScrollBy();
				const after = parentScrollContainer[scrollProperty];

				const diff = after - before;

				const situation = (() => {
					if (!casesHit.first) {
						return 'first';
					}
					// accelerating forwards
					if (
						side === 'end' &&
						currentMainAxisClientPoint < autoScrollHitbox[mainAxis.end] - maxSpeedBuffer
					) {
						return 'accelerating';
					}

					// accelerating backwards
					if (
						side === 'start' &&
						currentMainAxisClientPoint > autoScrollHitbox[mainAxis.start] + maxSpeedBuffer
					) {
						return 'accelerating';
					}

					return 'in-max-speed-buffer';
				})();

				// first hit: starting from the smallest scroll amount
				if (situation === 'first') {
					// side: start → scrolling backwards
					// side: start → scrolling forwards
					expect(diff).toBe(side === 'start' ? -1 : 1);
					casesHit.first = true;

					// when the acceleration percentage is less than 1,
					// we will roll up to the minimum scroll change of 1px
				} else if (situation === 'accelerating') {
					casesHit.accelerating.push(diff);

					// Using 'or equal to' because scrolls under 1% can result in the minimum scroll of 1px
					// There is an assertion outside of this loop to ensure that an acceleration occurred

					// scrolling forwards: scroll value is growing
					if (side === 'end') {
						expect(diff).toBeGreaterThanOrEqual(previousChange);
					} else {
						// scrolling forwards: scroll value is shrinking
						expect(diff).toBeLessThanOrEqual(previousChange);
					}

					// third case: we are in the max speed buffer
				} else {
					casesHit.inMaxSpeedBuffer = true;
					expect(diff).toBe(maxScrollInDirection);
				}

				previousChange = diff;

				// side: end → scrolling forwards and moving forwards through hitbox
				if (side === 'end') {
					currentMainAxisClientPoint++;
					// side: start → scrolling backwards and moving forwards through hitbox
				} else {
					currentMainAxisClientPoint--;
				}
			}
		}

		expect(casesHit.first).toBe(true);
		expect(casesHit.accelerating.length).toBeGreaterThan(0);
		expect(casesHit.inMaxSpeedBuffer).toBe(true);

		// asserting that acceleration occurred, and that we where not just on a single speed
		{
			const uniques = Array.from(new Set(casesHit.accelerating.map((value) => Math.round(value))));
			const expected = Array.from({ length: maxScrollPerFrame }, (_, index) => {
				const value = index + 1;
				return side === 'end' ? value : -value;
			});
			expect(uniques).toEqual(expected);
		}

		cleanup();
	});
});
