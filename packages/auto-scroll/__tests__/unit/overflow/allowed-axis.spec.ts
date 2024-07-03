import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

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
	setElementFromPoint,
	setStartSystemTime,
	setupBasicScrollContainer,
	stepScrollBy,
	userEvent,
} from '../_util';

jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

const OUTSIDE_OFFSET = 10;

describe('allowed axis', () => {
	const { child, parentScrollContainer } = setupBasicScrollContainer();

	const originalScrollTop = parentScrollContainer.scrollTop;
	const originalScrollLeft = parentScrollContainer.scrollLeft;

	afterEach(() => {
		parentScrollContainer.scrollTop = originalScrollTop;
		parentScrollContainer.scrollLeft = originalScrollLeft;
	});

	getScenarios(parentScrollContainer.getBoundingClientRect(), OUTSIDE_OFFSET).forEach(
		({ label, startPosition, endPosition, expectedMovement }) => {
			it(`should only scroll on axis that are allowed - ${label}`, () => {
				const events: Event[] = [];

				let allowedAxis: AllowedAxis = 'all';
				let axisScroll: AxisScroll;

				const cleanup = combine(
					appendToBody(parentScrollContainer),
					draggable({
						element: child,
						onDragStart: () => events.push({ type: 'draggable:start' }),
					}),
					dropTargetForElements({
						element: child,
						onDragStart: () => events.push({ type: 'dropTarget:start' }),
					}),
					unsafeOverflowAutoScrollForElements({
						element: parentScrollContainer,
						getOverflow: () => ({
							fromTopEdge: {
								top: 100,
								right: 100,
								left: 100,
							},
							fromRightEdge: {
								top: 100,
								right: 100,
								bottom: 100,
							},
							fromBottomEdge: {
								right: 100,
								bottom: 100,
								left: 100,
							},
							fromLeftEdge: {
								top: 100,
								left: 100,
								bottom: 100,
							},
						}),
						getAllowedAxis: () => allowedAxis,
					}),
					bind(parentScrollContainer, {
						type: 'scroll',
						listener: (event) => {
							events.push({
								type: 'scroll event',
								...hasAxisScrolled(parentScrollContainer, axisScroll),
							});
							axisScroll = getAxisScroll(parentScrollContainer);
						},
					}),
				);
				let unsetElementFromPoint = setElementFromPoint(child);

				// Scroll container is now looking over the center of the element
				parentScrollContainer.scrollTop = 500;
				parentScrollContainer.scrollLeft = 500;
				axisScroll = getAxisScroll(parentScrollContainer);

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

				fireEvent.dragOver(document.body, {
					clientX: endPosition.x,
					clientY: endPosition.y,
				});
				unsetElementFromPoint();
				unsetElementFromPoint = setElementFromPoint(document.body);

				// Second frame: allowedAxis is all.
				// Expecting a scroll to occur on expected axis.
				advanceTimersToNextFrame();
				stepScrollBy();

				const movement = {
					...expectedMovement,
				};

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
