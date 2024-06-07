import React from 'react';

import { render } from '@testing-library/react';

import { setup } from '../../../_utils/setup';

import App from './_utils/app';
import { type Control, forEachSensor, simpleLift } from './_utils/controls';
import { isDragging } from './_utils/helpers';

beforeAll(() => {
	setup();
});

it('should not have any errors when body is changed just before unmount', () => {
	jest.useFakeTimers();
	const { unmount } = render(<App />);

	expect(() => {
		document.body.innerHTML = '';
		unmount();
		jest.runOnlyPendingTimers();
	}).not.toThrow();

	jest.useRealTimers();
});

forEachSensor((control: Control) => {
	it('should not have any errors when body is changed just before unmount: mid drag', () => {
		const { unmount, getByText } = render(<App />);
		const handle: HTMLElement = getByText('item: 0');

		// mid drag
		simpleLift(control, handle);
		expect(isDragging(handle)).toEqual(true);

		expect(() => {
			document.body.innerHTML = '';
			unmount();
			jest.runOnlyPendingTimers();
		}).not.toThrow();
	});
});
