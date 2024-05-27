import React from 'react';

import { render } from '@testing-library/react';

import { setup } from '../../../../../_utils/setup';
import App from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
  setup();
});

function getCallCount(mySpy: jest.SpyInstance): number {
  return mySpy.mock.calls.length;
}

const addEventListener = jest.spyOn(window, 'addEventListener');
const removeEventListener = jest.spyOn(window, 'removeEventListener');

beforeEach(() => {
  addEventListener.mockClear();
  removeEventListener.mockClear();
});

forEachSensor((control: Control) => {
  it('should remove all window listeners when unmounting', () => {
    const { unmount } = render(<App />);

    unmount();

    expect(getCallCount(addEventListener)).toEqual(
      getCallCount(removeEventListener),
    );
  });

  it('should remove all window listeners when unmounting mid drag', () => {
    const { unmount, getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    // mid drag
    simpleLift(control, handle);
    expect(isDragging(handle)).toEqual(true);

    unmount();

    expect(getCallCount(addEventListener)).toEqual(
      getCallCount(removeEventListener),
    );
  });
});
