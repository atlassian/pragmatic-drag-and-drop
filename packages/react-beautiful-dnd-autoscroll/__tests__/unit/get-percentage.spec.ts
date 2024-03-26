import { getPercentage } from '../../src/internal/get-percentage';

describe('getPercentage()', () => {
  it('should return 0 for 0 range', () => {
    expect(
      getPercentage({ startOfRange: 100, endOfRange: 100, current: 300 }),
    ).toEqual(0);
  });

  it('should return correct percentages', () => {
    expect(
      getPercentage({ startOfRange: 100, endOfRange: 300, current: 200 }),
    ).toEqual(0.5);

    expect(
      getPercentage({ startOfRange: 100, endOfRange: 300, current: 250 }),
    ).toEqual(0.75);

    expect(
      getPercentage({ startOfRange: 100, endOfRange: 300, current: 300 }),
    ).toEqual(1);
  });
});
