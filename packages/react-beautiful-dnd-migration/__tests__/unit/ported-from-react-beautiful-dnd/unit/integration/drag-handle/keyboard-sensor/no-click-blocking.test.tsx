// This file was copied from `react-beautiful-dnd` with minor adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-handle/keyboard-sensor/no-click-blocking.spec.js>

import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import App from '../../_utils/app';
import { keyboard, simpleLift } from '../../_utils/controls';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

jest.useFakeTimers();

it('should not prevent clicks after a drag', () => {
  // clearing any pending listeners that have leaked from other tests
  fireEvent.click(window);

  const onDragStart = jest.fn();
  const onDragEnd = jest.fn();
  const { getByText } = render(
    <App onDragStart={onDragStart} onDragEnd={onDragEnd} />,
  );
  const handle: HTMLElement = getByText('item: 0');

  simpleLift(keyboard, handle);

  // flush start timer
  jest.runOnlyPendingTimers();
  expect(onDragStart).toHaveBeenCalled();
  keyboard.drop(handle);

  const event: Event = createEvent.click(handle);
  fireEvent(handle, event);

  // click not blocked
  expect(event.defaultPrevented).toBe(false);
  expect(onDragEnd).toHaveBeenCalled();
});
