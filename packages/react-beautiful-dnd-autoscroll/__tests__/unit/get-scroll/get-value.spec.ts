import { minScroll } from '../../../src/internal/constants';
import { dampenValueByTime } from '../../../src/internal/get-scroll/get-scroll-on-axis/dampen-value-by-time';
import type { DistanceThresholds } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-distance-thresholds';
import { getValue } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-value';
import { getValueFromDistance } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-value-from-distance';

jest.mock('../../../src/internal/get-scroll/get-scroll-on-axis/dampen-value-by-time', () => ({
	dampenValueByTime: jest.fn(),
}));

jest.mock('../../../src/internal/get-scroll/get-scroll-on-axis/get-value-from-distance', () => ({
	getValueFromDistance: jest.fn(),
}));

describe('getValue()', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	type Args = {
		distanceToEdge?: number;
		thresholds?: DistanceThresholds;
		dragStartTime?: number;
		shouldUseTimeDampening?: boolean;
	};

	const getScrollValue = (overrides?: Args) =>
		getValue({
			distanceToEdge: 1,
			thresholds: {
				startScrollingFrom: 1,
				maxScrollValueAt: 1,
			},
			dragStartTime: 1,
			shouldUseTimeDampening: true,
			...(overrides || {}),
		});

	it('should return 0 when its not enough distance to trigger a minimum scroll', () => {
		(getValueFromDistance as jest.Mock).mockReturnValue(0);

		expect(getScrollValue()).toEqual(0);
	});

	it('should return minimum scroll when dampen scroll value is lower than minimum scroll value', () => {
		const dampenValue = minScroll - 1;

		(getValueFromDistance as jest.Mock).mockReturnValue(10);
		(dampenValueByTime as jest.Mock).mockReturnValue(dampenValue);

		expect(getScrollValue()).toEqual(minScroll);
	});

	it('should return dampen scroll value when it is higher than minimum scroll value', () => {
		const dampenValue = minScroll + 1;

		(getValueFromDistance as jest.Mock).mockReturnValue(10);
		(dampenValueByTime as jest.Mock).mockReturnValue(dampenValue);

		expect(getScrollValue()).toEqual(dampenValue);
	});

	it('should return scroll value when shouldUseTimeDampening is false', () => {
		const scrollValue = 13;

		(getValueFromDistance as jest.Mock).mockReturnValue(scrollValue);

		expect(getScrollValue({ shouldUseTimeDampening: false })).toEqual(scrollValue);
	});
});
