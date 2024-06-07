// This file was copied from `react-beautiful-dnd` with minor adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-handle/keyboard-sensor/prevent-standard-keys-while-dragging.spec.js>

import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import App from '../../_utils/app';
import { keyboard, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

it('should prevent enter or tab being pressed during a drag', () => {
	const { getByText } = render(<App />);
	const handle: HTMLElement = getByText('item: 0');

	simpleLift(keyboard, handle);
	expect(isDragging(handle)).toBe(true);

	['Enter', 'Tab'].forEach((key) => {
		const event: Event = createEvent.keyDown(handle, { key });
		fireEvent(handle, event);
		expect(event.defaultPrevented).toBe(true);
	});
});
