import { getRect } from 'css-box-model';

import { vertical } from '../../../src/internal/constants';
import getScrollOnAxis from '../../../src/internal/get-scroll/get-scroll-on-axis';
import getValue from '../../../src/internal/get-scroll/get-scroll-on-axis/get-value';

jest.mock('../../../src/internal/get-scroll/get-scroll-on-axis/get-value', () =>
  jest.fn(),
);

describe('getScrollOnAxis()', () => {
  const defaultProps = {
    container: getRect({ top: 0, bottom: 100, left: 0, right: 50 }),
    distanceToEdges: { top: 0, bottom: 0, left: 0, right: 0 },
    dragStartTime: 0,
    axis: vertical,
    shouldUseTimeDampening: true,
  };
  const valueMock = 33;

  it('should return positive scroll value when draggable is closer to end', () => {
    (getValue as jest.Mock).mockReturnValue(valueMock);
    const scroll = getScrollOnAxis({
      ...defaultProps,
      distanceToEdges: { top: 10, bottom: 0, left: 0, right: 0 },
    });
    expect(scroll).toEqual(valueMock);
  });

  it('should return negative scroll value when draggable is closer to start', () => {
    (getValue as jest.Mock).mockReturnValue(valueMock);
    const scroll = getScrollOnAxis({
      ...defaultProps,
      distanceToEdges: { top: 0, bottom: 10, left: 0, right: 0 },
    });
    expect(scroll).toEqual(valueMock * -1);
  });
});
