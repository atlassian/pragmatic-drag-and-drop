import getMaxScroll from '../../src/internal/get-max-scroll';

describe('getMaxScroll()', () => {
	it('should return correct max scroll', () => {
		expect(
			getMaxScroll({
				scrollHeight: 800,
				scrollWidth: 500,
				height: 700,
				width: 400,
			}),
		).toEqual({
			x: 100,
			y: 100,
		});
	});
});
