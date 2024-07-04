import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import { setup } from '../../../../../_utils/setup';
import App from '../../_utils/app';
import { keyboard, simpleLift } from '../../_utils/controls';
import { getDropReason, isDragging } from '../../_utils/helpers';

beforeAll(() => {
	setup();
});

beforeEach(() => {
	jest.useFakeTimers({ legacyFakeTimers: true });
});

afterEach(() => {
	jest.clearAllTimers();
	jest.useRealTimers();
});

/**
 * These tests originally covered all sensors,
 * but in the migration layer the browser handles these behaviors for
 * pointer drags.
 */

it('should cancel when pressing escape', () => {
	const onDragEnd = jest.fn();
	const { getByText } = render(<App onDragEnd={onDragEnd} />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);
	expect(isDragging(handle)).toBe(true);

	// cancel
	const event: Event = createEvent.keyDown(handle, { key: 'Escape' });

	fireEvent(handle, event);

	// event consumed
	expect(event.defaultPrevented).toBe(true);
	// drag ended
	expect(isDragging(handle)).toBe(false);
	expect(onDragEnd.mock.calls[0][0].reason).toBe('CANCEL');
});

it('should cancel when window is resized', () => {
	const onDragEnd = jest.fn();
	const { getByText } = render(<App onDragEnd={onDragEnd} />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);
	expect(isDragging(handle)).toBe(true);

	// cancel
	const event: Event = new Event('resize', {
		bubbles: true,
		cancelable: true,
	});

	fireEvent(handle, event);

	// event not consumed as it is an indirect cancel
	expect(event.defaultPrevented).toBe(false);
	// drag ended
	expect(isDragging(handle)).toBe(false);
	expect(onDragEnd.mock.calls[0][0].reason).toBe('CANCEL');
});

it('should cancel when there is a visibility change', () => {
	const onDragEnd = jest.fn();
	const { getByText } = render(<App onDragEnd={onDragEnd} />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);
	expect(isDragging(handle)).toBe(true);

	// cancel
	const event: Event = new Event('visibilitychange', {
		bubbles: true,
		cancelable: true,
	});

	fireEvent(handle, event);

	// event not consumed as it is an indirect cancel
	expect(event.defaultPrevented).toBe(false);
	// drag ended
	expect(isDragging(handle)).toBe(false);
	expect(getDropReason(onDragEnd)).toBe('CANCEL');
});
