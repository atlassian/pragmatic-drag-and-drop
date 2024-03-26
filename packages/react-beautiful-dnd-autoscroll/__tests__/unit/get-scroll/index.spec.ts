import { getRect } from 'css-box-model';

import getScroll from '../../../src/internal/get-scroll';
import getScrollOnAxis from '../../../src/internal/get-scroll/get-scroll-on-axis';

jest.mock('../../../src/internal/get-scroll/get-scroll-on-axis', () =>
  jest.fn(),
);

describe('getScroll()', () => {
  const defaultProps = {
    dragStartTime: 0,
    container: getRect({ top: 0, bottom: 100, left: 0, right: 50 }),
    center: { x: 0, y: 0 },
    shouldUseTimeDampening: true,
  };

  it('should return null when scroll has not change', () => {
    (getScrollOnAxis as jest.Mock).mockReturnValue(0);
    const change = getScroll(defaultProps);
    expect(change).toEqual(null);
  });

  it('should return new scroll value', () => {
    const mockY = 10;
    const mockX = 15;
    (getScrollOnAxis as jest.Mock).mockReturnValueOnce(mockY);
    (getScrollOnAxis as jest.Mock).mockReturnValueOnce(mockX);

    const change = getScroll(defaultProps);
    expect(change).toEqual({ x: mockX, y: mockY });
  });
});
