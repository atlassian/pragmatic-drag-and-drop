// This file was copied from `react-beautiful-dnd` with minor adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-handle/keyboard-sensor/starting-a-drag.spec.js>

import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import App from '../../_utils/app';
import { isDragging } from '../../_utils/helpers';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

it('should prevent the default keyboard action when lifting', () => {
	const { getByText } = render(<App />);
	const handle: HTMLElement = getByText('item: 0');

	const event: Event = createEvent.keyDown(handle, { key: ' ' });
	fireEvent(handle, event);

	expect(isDragging(handle)).toBe(true);
	expect(event.defaultPrevented).toBe(true);
});
