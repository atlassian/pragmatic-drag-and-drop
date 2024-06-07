import React from 'react';

import { render } from '@testing-library/react';

import { setup } from '../../../../../_utils/setup';
import App, { type Item } from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
	setup();
});

forEachSensor((control: Control) => {
	it('should not start a drag if disabled', () => {
		const items: Item[] = [{ id: '0', isEnabled: false }];

		const { getByText } = render(<App items={items} />);
		const handle: HTMLElement = getByText('item: 0');

		simpleLift(control, handle);

		expect(isDragging(handle)).toBe(false);
	});
});
