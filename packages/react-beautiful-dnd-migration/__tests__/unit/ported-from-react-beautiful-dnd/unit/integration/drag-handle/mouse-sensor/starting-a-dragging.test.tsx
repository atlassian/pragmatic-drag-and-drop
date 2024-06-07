import React from 'react';

import { createEvent, fireEvent, render } from '@testing-library/react';

import { withSetElementFromPoint } from '../../../../../_utils/with-set-element-from-point';
import App from '../../_utils/app';
import { isDragging } from '../../_utils/helpers';

it('should not start a drag if a modifier key was used while pressing the mouse down', () => {
	// if any drag is started with these keys pressed then we do not start a drag
	const keys: string[] = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];
	const { getByText } = render(<App />);
	const handle: HTMLElement = getByText('item: 0');

	keys.forEach((key: string) => {
		const dragStartEvent = createEvent.dragStart(handle, {
			[key]: true,
		});

		withSetElementFromPoint(handle, () => {
			fireEvent(handle, dragStartEvent);
		});

		expect(dragStartEvent.defaultPrevented).toBe(true);
		expect(isDragging(handle)).toBe(false);
	});
});
