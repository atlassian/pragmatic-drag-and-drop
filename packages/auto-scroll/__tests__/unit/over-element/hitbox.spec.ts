import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { autoScrollForElements } from '../../../src/entry-point/element';
import type { Axis, Side } from '../../../src/internal-types';
import { axisLookup } from '../../../src/shared/axis';
import { getInternalConfig } from '../../../src/shared/configuration';
import {
	advanceTimersToNextFrame,
	appendToBody,
	getInsidePoints,
	getOutsidePoints,
	getRect,
	reset,
	setElementFromPointToBe,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

type Scenario = {
	side: Side;
	hitbox: DOMRect;
	axis: Axis;
};

type Group = {
	label: string;
	child: HTMLElement;
	parentScrollContainer: HTMLElement;
	scenarios: Scenario[];
};

const defaultConfig = getInternalConfig();

const smallGroup: Group = (() => {
	const { child, parentScrollContainer } = setupBasicScrollContainer({
		// where a hitbox would be less than `defaultConfig.max
		scrollContainer: { width: 400, height: 400 },
		child: { width: 100000, height: 100000 },
	});

	const rect = parentScrollContainer.getBoundingClientRect();

	const scenarios: Scenario[] = [
		{
			side: 'start',
			axis: 'vertical',
			hitbox: getRect({
				top: rect.top,
				left: rect.left,
				bottom:
					rect.top + rect.height * defaultConfig.startHitboxAtPercentageRemainingOfElement['top'],
				right: rect.right,
			}),
		},
		{
			side: 'end',
			axis: 'vertical',
			hitbox: getRect({
				top:
					rect.bottom -
					rect.height * defaultConfig.startHitboxAtPercentageRemainingOfElement['bottom'],
				left: rect.left,
				bottom: rect.bottom,
				right: rect.right,
			}),
		},
		{
			side: 'start',
			axis: 'horizontal',
			hitbox: getRect({
				top: rect.top,
				left: rect.left,
				bottom: rect.bottom,
				right:
					rect.left + rect.width * defaultConfig.startHitboxAtPercentageRemainingOfElement['top'],
			}),
		},
		{
			side: 'end',
			axis: 'horizontal',
			hitbox: getRect({
				top: rect.top,
				left:
					rect.right -
					rect.width * defaultConfig.startHitboxAtPercentageRemainingOfElement['bottom'],
				bottom: rect.bottom,
				right: rect.right,
			}),
		},
	];

	// validating all hitboxes are less than 200px in size
	scenarios.forEach((scenario) => {
		const { mainAxis } = axisLookup[scenario.axis];
		const size =
			scenario.hitbox[mainAxis.size] *
			defaultConfig.startHitboxAtPercentageRemainingOfElement[mainAxis[scenario.side]];
		invariant(
			size < defaultConfig.maxMainAxisHitboxSize,
			'Expected hitbox to be less than the max hitbox size',
		);
	});

	return {
		label: 'Small scroll container',
		scenarios,
		child,
		parentScrollContainer,
	};
})();

const largeGroup: Group = (() => {
	const { child, parentScrollContainer } = setupBasicScrollContainer({
		scrollContainer: { width: 10000, height: 10000 },
		child: { width: 100000, height: 100000 },
	});

	const rect = parentScrollContainer.getBoundingClientRect();

	const scenarios: Scenario[] = [
		{
			side: 'start',
			axis: 'vertical',
			hitbox: getRect({
				top: rect.top,
				left: rect.left,
				bottom: rect.top + defaultConfig.maxMainAxisHitboxSize,
				right: rect.right,
			}),
		},
		{
			side: 'end',
			axis: 'vertical',
			hitbox: getRect({
				top: rect.bottom - defaultConfig.maxMainAxisHitboxSize,
				left: rect.left,
				bottom: rect.bottom,
				right: rect.right,
			}),
		},
		{
			side: 'start',
			axis: 'horizontal',
			hitbox: getRect({
				top: rect.top,
				left: rect.left,
				bottom: rect.bottom,
				right: rect.left + defaultConfig.maxMainAxisHitboxSize,
			}),
		},
		{
			side: 'end',
			axis: 'horizontal',
			hitbox: getRect({
				top: rect.top,
				left: rect.right - defaultConfig.maxMainAxisHitboxSize,
				bottom: rect.bottom,
				right: rect.right,
			}),
		},
	];

	// validating all hitboxes would be greater than `defaultConfig.maxMainAxisHitboxSize`
	// (and so will be capped to defaultConfig.maxMainAxisHitboxSize later)
	scenarios.forEach((scenario) => {
		const { mainAxis } = axisLookup[scenario.axis];
		const potentialHitboxSize =
			rect[mainAxis.size] *
			defaultConfig.startHitboxAtPercentageRemainingOfElement[mainAxis[scenario.side]];
		invariant(
			potentialHitboxSize > defaultConfig.maxMainAxisHitboxSize,
			`hitbox size: (${potentialHitboxSize}) is not > (${defaultConfig.maxMainAxisHitboxSize})`,
		);
	});

	return {
		label: `Large scroll container (will be capped to ${defaultConfig.maxMainAxisHitboxSize}px hitbox)`,
		scenarios,
		child,
		parentScrollContainer,
	};
})();

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

[smallGroup, largeGroup].forEach(({ label, parentScrollContainer, child, scenarios }) => {
	describe(`Group: ${label}`, () => {
		const originalScrollTop = parentScrollContainer.scrollTop;
		const originalScrollLeft = parentScrollContainer.scrollLeft;

		afterEach(() => {
			parentScrollContainer.scrollTop = originalScrollTop;
			parentScrollContainer.scrollLeft = originalScrollLeft;
		});

		scenarios.forEach((scenario) => {
			const { mainAxis } = axisLookup[scenario.axis];
			const scrollProperty = scenario.axis === 'vertical' ? 'scrollTop' : 'scrollLeft';

			describe(`axis: ${scenario.axis}, side: ${scenario.side} [on boundary]`, () => {
				getInsidePoints(scenario.hitbox).forEach((point) => {
					test(`point: [${point.label}] {x: ${point.x}, y: ${point.y}}`, () => {
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

						// Scroll container is now looking over the center of the element
						const initialScrollValue = child.getBoundingClientRect()[mainAxis.size] / 2;
						parentScrollContainer[scrollProperty] = initialScrollValue;

						// lifting on the top vertical edge of the container
						userEvent.lift(child, {
							clientX: point.x,
							clientY: point.y,
						});

						expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
						ordered.length = 0;

						// on first frame, there is no auto scroll as
						// we don't know what the scroll speed should be until
						// a single frame has passed
						advanceTimersToNextFrame();

						expect(ordered).toEqual([]);

						// scroll container has still not scrolled
						expect(parentScrollContainer[scrollProperty]).toBe(initialScrollValue);

						// Triggering another auto scroll - should be the minimum scroll
						{
							const before = parentScrollContainer[scrollProperty];
							advanceTimersToNextFrame();
							stepScrollBy();
							const after = parentScrollContainer[scrollProperty];

							// only a single scroll event
							expect(ordered).toEqual(['scroll event']);

							// Scrolling up → scroll value will get lower
							// Scrolling down → scroll value will get higher
							// Scrolling on the "start" will scroll backwards
							// Scrolling on the "end" will scroll forwards
							expect(after - before).toBe(scenario.side === 'start' ? -1 : 1);
						}

						cleanup();
					});
				});
			});

			describe(`axis: ${scenario.axis}, side: ${scenario.side} [outside boundary]`, () => {
				getOutsidePoints(scenario.hitbox).forEach((point) => {
					test(`point: [${point.label}] {x: ${point.x}, y: ${point.y}}`, () => {
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

						// Scroll container is now looking over the center of the element
						const initialScrollValue = child.getBoundingClientRect()[mainAxis.size] / 2;
						parentScrollContainer[scrollProperty] = initialScrollValue;

						// lifting on the top vertical edge of the container
						userEvent.lift(child, {
							clientX: point.x,
							clientY: point.y,
						});

						expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
						ordered.length = 0;

						// on first frame, there is no auto scroll as
						// we don't know what the scroll speed should be until
						// a single frame has passed
						advanceTimersToNextFrame();

						expect(ordered).toEqual([]);

						// scroll container has still not scrolled
						expect(parentScrollContainer[scrollProperty]).toBe(initialScrollValue);

						// No auto scroll should be triggered in the next frame
						{
							const before = parentScrollContainer[scrollProperty];
							advanceTimersToNextFrame();
							stepScrollBy();
							const after = parentScrollContainer[scrollProperty];

							// only a single scroll event
							// expect(ordered).toEqual(['scroll event']);

							// Scrolling up → scroll value will get lower
							// Scrolling down → scroll value will get higher
							// Scrolling on the "start" will scroll backwards
							// Scrolling on the "end" will scroll forwards
							expect(after - before).toBe(0);
						}

						cleanup();
					});
				});
			});
		});
	});
});
