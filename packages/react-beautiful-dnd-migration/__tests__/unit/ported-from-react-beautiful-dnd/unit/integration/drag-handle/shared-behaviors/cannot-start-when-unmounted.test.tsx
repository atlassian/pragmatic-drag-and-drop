import React from 'react';

import { render } from '@testing-library/react';

import App from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

forEachSensor((control: Control) => {
  it('should not allow starting after the handle is unmounted', () => {
    const { getByText, unmount } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    unmount();

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(false);
  });
});
