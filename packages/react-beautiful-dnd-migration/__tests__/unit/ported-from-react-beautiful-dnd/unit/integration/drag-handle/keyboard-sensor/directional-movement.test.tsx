// This file was copied from `react-beautiful-dnd` with minor adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-handle/keyboard-sensor/directional-movement.spec.js>

import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import App from '../../_utils/app';
import { keyboard, simpleLift } from '../../_utils/controls';

beforeAll(() => {
	/**
	 * Jest does not implement `scrollIntoView` so we have to mock it.
	 */
	HTMLElement.prototype.scrollIntoView = jest.fn();
});

jest.useFakeTimers();

it('should move up when pressing the up arrow', () => {
	const onDragUpdate = jest.fn();
	const { getByText } = render(<App onDragUpdate={onDragUpdate} />);
	const handle: HTMLElement = getByText('item: 1');

	simpleLift(keyboard, handle);

	const event: Event = createEvent.keyDown(handle, { key: 'ArrowUp' });
	fireEvent(handle, event);

	// flush async responder
	jest.runOnlyPendingTimers();
	expect(onDragUpdate).toHaveBeenCalled();
	expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(0);

	// event consumed
	expect(event.defaultPrevented).toBe(true);
});

it('should move down when pressing the down arrow', () => {
	const onDragUpdate = jest.fn();
	const { getByText } = render(<App onDragUpdate={onDragUpdate} />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);

	const event: Event = createEvent.keyDown(handle, { key: 'ArrowDown' });
	fireEvent(handle, event);

	// flush async responder
	jest.runOnlyPendingTimers();
	expect(onDragUpdate).toHaveBeenCalled();
	expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(1);

	// event consumed
	expect(event.defaultPrevented).toBe(true);
});

it('should move right when pressing the right arrow', () => {
	const onDragUpdate = jest.fn();
	const { getByText } = render(<App onDragUpdate={onDragUpdate} direction="horizontal" />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);

	const event: Event = createEvent.keyDown(handle, { key: 'ArrowRight' });
	fireEvent(handle, event);

	// flush async responder
	jest.runOnlyPendingTimers();
	expect(onDragUpdate).toHaveBeenCalled();
	expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(1);

	// event consumed
	expect(event.defaultPrevented).toBe(true);
});

it('should move left when pressing the left arrow', () => {
	const onDragUpdate = jest.fn();
	const { getByText } = render(<App onDragUpdate={onDragUpdate} direction="horizontal" />);
	const handle: HTMLElement = getByText('item: 1');

	simpleLift(keyboard, handle);

	const event: Event = createEvent.keyDown(handle, { key: 'ArrowLeft' });
	fireEvent(handle, event);

	// flush async responder
	jest.runOnlyPendingTimers();
	expect(onDragUpdate).toHaveBeenCalled();
	expect(onDragUpdate.mock.calls[0][0].destination.index).toBe(0);

	// event consumed
	expect(event.defaultPrevented).toBe(true);
});
