// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/droppable/clone.spec.js>

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type { DraggableStateSnapshot } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { setElementFromPoint } from '../../../../_util';
import App, { type RenderItem } from '../_utils/app';
import { forEachSensor, mouse, simpleLift } from '../_utils/controls';
import {
	type Call,
	getCallsFor,
	getLast,
	isClone,
	isDragging,
	renderItemAndSpy,
} from '../_utils/helpers';

HTMLElement.prototype.scrollIntoView = jest.fn();

/**
 * These tests originally used only the keyboard.
 *
 * In the port they now use both types of control.
 */

forEachSensor((control) => {
	it('should no longer render the original draggable while dragging', () => {
		const { getByTestId } = render(<App useClone />);

		// doing this in a loop to ensure that multiple reorders is fine
		Array.from({ length: 4 }).forEach(() => {
			const beforeLift = getByTestId('0');
			setElementFromPoint(beforeLift);
			simpleLift(control, beforeLift);
			expect(isClone(beforeLift)).toBe(false);

			// after lift there is still only one item - but it is different
			const clone = getByTestId('0');
			expect(clone).not.toBe(beforeLift);
			expect(isClone(clone)).toBe(true);
			expect(isDragging(clone)).toBe(true);

			control.drop(clone);

			const finished = getByTestId('0');
			expect(finished).not.toBe(clone);
			expect(isClone(finished)).toBe(false);
			expect(isDragging(finished)).toBe(false);
		});
	});

	it('should render a dragging item into the container', () => {
		invariant(document.body);

		// default location is the body
		{
			const { unmount, getByTestId } = render(<App useClone />);
			setElementFromPoint(getByTestId('0'));
			simpleLift(control, getByTestId('0'));
			expect(getByTestId('0').parentElement).toBe(document.body);
			unmount();
		}
		{
			const element: HTMLElement = document.createElement('div');
			document.body.appendChild(element);
			const { unmount, getByTestId } = render(
				<App useClone getContainerForClone={() => element} />,
			);
			setElementFromPoint(getByTestId('0'));
			simpleLift(control, getByTestId('0'));
			expect(getByTestId('0').parentElement).toBe(element);
			unmount();
		}
	});

	it('should give the clone the starting location', () => {
		const spy = jest.fn();
		const renderItem: RenderItem = renderItemAndSpy(spy);
		const { getByTestId } = render(<App renderItem={renderItem} useClone />);

		setElementFromPoint(getByTestId('1'));
		simpleLift(control, getByTestId('1'));

		const last: Call | null = getLast(getCallsFor('1', spy));
		invariant(last);
		const expected: DraggableStateSnapshot = {
			isClone: true,
			isDragging: true,
			isDropAnimating: false,
			dropAnimation: null,
			combineTargetFor: null,
			combineWith: null,
			draggingOver: 'droppable',
			mode: control === mouse ? 'FLUID' : 'SNAP',
		};
		expect(last[1]).toEqual(expected);
	});

	/**
	 * This test doesn't make as much sense for the migration layer,
	 * because there is no drop animation.
	 */
	it('should allow reordering other items when dropping', () => {
		const { getByTestId } = render(<App useClone />);

		setElementFromPoint(getByTestId('0'));
		simpleLift(control, getByTestId('0'));

		const clone: HTMLElement = getByTestId('0');
		expect(isClone(clone)).toBe(true);
		expect(isDragging(clone)).toBe(true);

		// move item 0 to index 1
		fireEvent.dragEnter(getByTestId('1'));

		// drop started, but still occurring
		control.drop(clone);

		// starting a new drag with item 1 (which is in index 0 visually now)
		setElementFromPoint(getByTestId('1'));
		simpleLift(control, getByTestId('1'));

		expect(isDragging(getByTestId('1'))).toBe(true);
		expect(isDragging(getByTestId('0'))).toBe(false);
	});
});
