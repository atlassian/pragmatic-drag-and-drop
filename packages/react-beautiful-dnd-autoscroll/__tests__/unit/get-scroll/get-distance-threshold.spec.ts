import { getRect } from 'css-box-model';

import { horizontal, vertical } from '../../../src/internal/constants';
import { getDistanceThresholds } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-distance-thresholds';

describe('getDistanceThresholds()', () => {
  it('should return correct threshold for horizontal axis', () => {
    expect(
      getDistanceThresholds(
        getRect({ top: 0, bottom: 100, left: 0, right: 50 }),
        horizontal,
      ),
    ).toEqual({
      maxScrollValueAt: 2.5,
      startScrollingFrom: 12.5,
    });

    expect(
      getDistanceThresholds(
        getRect({ top: 0, bottom: 100, left: 30, right: 55 }),
        horizontal,
      ),
    ).toEqual({
      maxScrollValueAt: 1.25,
      startScrollingFrom: 6.25,
    });

    expect(
      getDistanceThresholds(
        getRect({ top: 0, bottom: 100, left: 50, right: 90 }),
        horizontal,
      ),
    ).toEqual({
      maxScrollValueAt: 2,
      startScrollingFrom: 10,
    });
  });

  it('should return correct threshold for vertical axis', () => {
    expect(
      getDistanceThresholds(
        getRect({ top: 0, bottom: 100, left: 0, right: 50 }),
        vertical,
      ),
    ).toEqual({
      maxScrollValueAt: 5,
      startScrollingFrom: 25,
    });

    expect(
      getDistanceThresholds(
        getRect({ top: 20, bottom: 80, left: 0, right: 50 }),
        vertical,
      ),
    ).toEqual({
      maxScrollValueAt: 3,
      startScrollingFrom: 15,
    });

    expect(
      getDistanceThresholds(
        getRect({ top: 30, bottom: 50, left: 0, right: 50 }),
        vertical,
      ),
    ).toEqual({
      maxScrollValueAt: 1,
      startScrollingFrom: 5,
    });
  });
});
