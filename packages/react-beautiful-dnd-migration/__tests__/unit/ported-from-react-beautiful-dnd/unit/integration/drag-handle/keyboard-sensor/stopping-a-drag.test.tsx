// This file was copied from `react-beautiful-dnd` with minor adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-handle/keyboard-sensor/stopping-a-drag.spec.js>

import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import App from '../../_utils/app';
import { keyboard, simpleLift } from '../../_utils/controls';
import { getDropReason, isDragging } from '../../_utils/helpers';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

it('should prevent default on the event that causes a drop', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);
  expect(isDragging(handle)).toBe(true);

  const event: Event = createEvent.keyDown(handle, { key: ' ' });
  fireEvent(handle, event);

  expect(event.defaultPrevented).toBe(true);
  expect(getDropReason(onDragEnd)).toBe('DROP');
});

it('should prevent default on an escape press', () => {
  const onDragEnd = jest.fn();
  const { getByText } = render(<App onDragEnd={onDragEnd} />);
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);
  expect(isDragging(handle)).toBe(true);

  const event: Event = createEvent.keyDown(handle, { key: 'Escape' });
  fireEvent(handle, event);

  expect(event.defaultPrevented).toBe(true);
  expect(getDropReason(onDragEnd)).toBe('CANCEL');
});

it('should not prevent the default behaviour for an indirect cancel', () => {
  [
    'mousedown',
    'mouseup',
    'click',
    'touchstart',
    'resize',
    'wheel',
    // rbd also tested the browser prefixed versions of this event,
    // but browser support now is good so I removed them
    'visibilitychange',
  ].forEach((eventName: string) => {
    const onDragEnd = jest.fn();
    const { getByText, unmount } = render(<App onDragEnd={onDragEnd} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(keyboard, handle);
    expect(isDragging(handle)).toBe(true);

    const event: Event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
      // target: handle,
    });

    fireEvent(handle, event);

    // not an explicit cancel
    expect(event.defaultPrevented).toBe(false);
    expect(getDropReason(onDragEnd)).toBe('CANCEL');

    unmount();
  });
});
