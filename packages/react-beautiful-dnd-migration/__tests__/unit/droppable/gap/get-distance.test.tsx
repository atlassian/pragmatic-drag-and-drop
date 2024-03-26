import { getDistance } from '../../../../src/droppable/gap/get-distance';

const width = 10;
const height = 5;

/**
 * This is a browser API that is not defined in the testing environment.
 */

function getRects({ dx, dy }: { dx: number; dy: number }): [DOMRect, DOMRect] {
  const a = DOMRect.fromRect({ x: 0, y: 0, width, height });
  const b = DOMRect.fromRect({ x: width + dx, y: height + dy, width, height });
  return [a, b];
}

describe('getDistance()', () => {
  describe('when direction="vertical"', () => {
    const dx = 10;

    it('should return the vertical distance', () => {
      const dy = 20;
      const [a, b] = getRects({ dx, dy });
      const distance = getDistance({
        a,
        b,
        direction: 'vertical',
      });

      expect(distance).toBe(dy);
    });

    it('should not depend on order', () => {
      const dy = 20;
      const [a, b] = getRects({ dx, dy });
      const distance = getDistance({
        a: b,
        b: a,
        direction: 'vertical',
      });

      expect(distance).toBe(dy);
    });
  });

  describe('when direction="horizontal"', () => {
    const dy = 10;

    it('should return the horizontal distance', () => {
      const dx = 20;
      const [a, b] = getRects({ dx, dy });
      const distance = getDistance({
        a,
        b,
        direction: 'horizontal',
      });

      expect(distance).toBe(dx);
    });

    it('should not depend on order', () => {
      const dx = 20;
      const [a, b] = getRects({ dx, dy });
      const distance = getDistance({
        a: b,
        b: a,
        direction: 'horizontal',
      });

      expect(distance).toBe(dx);
    });
  });
});
