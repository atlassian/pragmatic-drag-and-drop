import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { autoScrollForElements } from '../../../src/entry-point/element';
import { type AllowedAxis } from '../../../src/internal-types';
import {
	advanceTimersToNextFrame,
	appendToBody,
	type AxisScroll,
	type Event,
	getAxisScroll,
	getExpectedEvents,
	getScenarios,
	hasAxisScrolled,
	reset,
	setElementFromPointToBe,
	setStartSystemTime,
	setupBasicScrollContainer,
	setupNestedScrollContainers,
	stepScrollBy,
	userEvent,
} from '../_util';

jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

describe('allowed axis', () => {
	const { child, parentScrollContainer: parent } = setupBasicScrollContainer();

	const originalScrollTop = parent.scrollTop;
	const originalScrollLeft = parent.scrollLeft;

	afterEach(() => {
		parent.scrollTop = originalScrollTop;
		parent.scrollLeft = originalScrollLeft;
	});

	getScenarios(parent.getBoundingClientRect()).forEach(
		({ label, startPosition, expectedMovement }) => {
			it(`should only scroll on axis that are allowed - ${label}`, () => {
				const events: Event[] = [];

				let allowedAxis: AllowedAxis = 'all';
				let axisScroll: AxisScroll;

				const cleanup = combine(
					appendToBody(parent),
					draggable({
						element: child,
						onDragStart: () => events.push({ type: 'draggable:start' }),
					}),
					dropTargetForElements({
						element: child,
						onDragStart: () => events.push({ type: 'dropTarget:start' }),
					}),
					autoScrollForElements({
						element: parent,
						getAllowedAxis: () => allowedAxis,
					}),
					setElementFromPointToBe(child),
					bind(parent, {
						type: 'scroll',
						listener: (event) => {
							events.push({
								type: 'scroll event',
								...hasAxisScrolled(parent, axisScroll),
							});
							axisScroll = getAxisScroll(parent);
						},
					}),
				);

				// Scroll container is now looking over the center of the element
				parent.scrollTop = 500;
				parent.scrollLeft = 500;
				axisScroll = getAxisScroll(parent);

				userEvent.lift(child, {
					clientX: startPosition.x,
					clientY: startPosition.y,
				});

				expect(events).toEqual([{ type: 'draggable:start' }, { type: 'dropTarget:start' }]);
				events.length = 0;

				// First frame: allowedAxis is all.
				// Expecting no scroll to occur.
				// We don't know what the scroll speed should be until a single frame has passed.
				advanceTimersToNextFrame();
				stepScrollBy();

				expect(events).toEqual([]);

				// Second frame: allowedAxis is all.
				// Expecting a scroll to occur on expected axis.
				advanceTimersToNextFrame();
				stepScrollBy();

				const movement = { ...expectedMovement };
				const expectedEvents = getExpectedEvents(movement);

				expect(events).toEqual(expectedEvents);
				events.length = 0;

				// Third frame: allowedAxis is vertical.
				// Expecting a scroll to occur on expected axis, except horizontal.
				// If neither are expected, expect no scroll.
				allowedAxis = 'vertical';

				advanceTimersToNextFrame();
				stepScrollBy();

				const verticalMovement = {
					...expectedMovement,
					horizontal: false,
				};
				const expectedVerticalEvents = getExpectedEvents(verticalMovement);

				expect(events).toEqual(expectedVerticalEvents);
				events.length = 0;

				// Fourth frame: allowedAxis is horizontal.
				// Expecting a scroll to occur on expected axis, except vertical.
				// If neither are expected, expect no scroll.
				allowedAxis = 'horizontal';

				advanceTimersToNextFrame();
				stepScrollBy();

				const horizontalMovement = {
					...expectedMovement,
					vertical: false,
				};
				const expectedHorizontalEvents = getExpectedEvents(horizontalMovement);

				expect(events).toEqual(expectedHorizontalEvents);
				cleanup();
			});
		},
	);
});

it('should scroll on available parent axis if child axis are not allowed', () => {
	const [child, parent, grandParent] = setupNestedScrollContainers([
		{ width: 10000, height: 10000 },
		{ width: 1000, height: 1000 },
		{ width: 1000, height: 1000 },
	]);

	const events: Event[] = [];

	let parentAllowedAxis: AllowedAxis = 'all';
	let parentAxisScroll: AxisScroll;

	let grandParentAllowedAxis: AllowedAxis = 'all';
	let grandParentAxisScroll: AxisScroll;

	const cleanup = combine(
		appendToBody(grandParent),
		draggable({
			element: child,
			onDragStart: () => events.push({ type: 'draggable:start' }),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => events.push({ type: 'dropTarget:start' }),
		}),
		dropTargetForElements({
			element: parent,
			onDragStart: () => events.push({ type: 'parent:start' }),
		}),
		dropTargetForElements({
			element: grandParent,
			onDragStart: () => events.push({ type: 'grandParent:start' }),
		}),
		autoScrollForElements({
			element: parent,
			getAllowedAxis: () => parentAllowedAxis,
		}),
		autoScrollForElements({
			element: grandParent,
			getAllowedAxis: () => grandParentAllowedAxis,
		}),
		setElementFromPointToBe(child),
		bind(parent, {
			type: 'scroll',
			listener: (event) => {
				events.push({
					type: 'parent:scroll',
					...hasAxisScrolled(parent, parentAxisScroll),
				});
				parentAxisScroll = getAxisScroll(parent);
			},
		}),
		bind(grandParent, {
			type: 'scroll',
			listener: (event) => {
				events.push({
					type: 'grandParent:scroll',
					...hasAxisScrolled(grandParent, grandParentAxisScroll),
				});
				grandParentAxisScroll = getAxisScroll(grandParent);
			},
		}),
	);

	// Set some initial scroll on the scroll containers
	parent.scrollTop = 60;
	parent.scrollLeft = 60;
	parentAxisScroll = getAxisScroll(parent);

	grandParent.scrollTop = 120;
	grandParent.scrollLeft = 120;
	grandParentAxisScroll = getAxisScroll(grandParent);

	// Lifting the shared top left corner
	userEvent.lift(child, {
		clientX: grandParent.getBoundingClientRect().left,
		clientY: grandParent.getBoundingClientRect().top,
	});

	expect(events).toEqual([
		{ type: 'draggable:start' },
		{ type: 'dropTarget:start' },
		{ type: 'parent:start' },
		{ type: 'grandParent:start' },
	]);
	events.length = 0;

	// First frame: parent allowedAxis is all, grandparent allowedAxis is all.
	// Expecting no scroll to occur.
	// We don't know what the scroll speed should be until a single frame has passed.
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(events).toEqual([]);

	// Second frame: parent allowedAxis is all, grandparent allowedAxis is all.
	// Expecting a scroll to occur on both parent axis.
	advanceTimersToNextFrame();
	stepScrollBy();

	expect(events).toEqual([{ type: 'parent:scroll', horizontal: true, vertical: true }]);
	events.length = 0;

	// Third frame: parent allowedAxis is vertical, grandparent allowedAxis is all.
	// Expecting a scroll to occur on parent vertical axis, but not horizontal.
	// Expecting a scroll to occur on grandparent horizontal axis, but not vertical.
	parentAllowedAxis = 'vertical';
	grandParentAllowedAxis = 'all';

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(events).toEqual([
		{ type: 'parent:scroll', horizontal: false, vertical: true },
		{ type: 'grandParent:scroll', horizontal: true, vertical: false },
	]);
	events.length = 0;

	// Fourth frame: parent allowedAxis is horizontal, grandparent allowedAxis is all.
	// Expecting a scroll to occur on parent horizontal axis, but not vertical.
	// Expecting a scroll to occur on grandparent vertical axis, but not horizontal.
	parentAllowedAxis = 'horizontal';
	grandParentAllowedAxis = 'all';

	advanceTimersToNextFrame();
	stepScrollBy();

	expect(events).toEqual([
		{ type: 'parent:scroll', horizontal: true, vertical: false },
		{ type: 'grandParent:scroll', horizontal: false, vertical: true },
	]);
	events.length = 0;

	cleanup();
});
