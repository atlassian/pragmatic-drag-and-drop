import React from 'react';

import { render } from '@testing-library/react';

import { setup } from '../../../../../_utils/setup';
import App from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
  setup();
});

forEachSensor((control: Control) => {
  it('should not abort a drag if a parent render occurs', () => {
    const { getByText, rerender } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    rerender(<App />);

    // handle element is unchanged
    expect(getByText('item: 0')).toBe(handle);
    // it is still dragging
    expect(isDragging(handle)).toBe(true);
  });
});
