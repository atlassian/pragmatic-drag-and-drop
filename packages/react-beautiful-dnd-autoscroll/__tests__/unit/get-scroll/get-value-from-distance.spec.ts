import config from '../../../src/internal/config';
import { minScroll } from '../../../src/internal/constants';
import type { DistanceThresholds } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-distance-thresholds';
import { getValueFromDistance } from '../../../src/internal/get-scroll/get-scroll-on-axis/get-value-from-distance';

describe('getValueFromDistance()', () => {
	const getValue = ({
		distanceToEdge,
		thresholds,
	}: {
		distanceToEdge: number;
		thresholds: DistanceThresholds;
	}) => getValueFromDistance(distanceToEdge, thresholds);

	it('should return 0 when its too far away to auto scroll', () => {
		expect(
			getValue({
				distanceToEdge: 150,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(0);
	});

	it('should use max speed when on or over boundary', () => {
		expect(
			getValue({
				distanceToEdge: 30,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(config.maxPixelScroll);
	});

	it('should return minimum scroll when just going on the boundary', () => {
		expect(
			getValue({
				distanceToEdge: 100,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(minScroll);
	});

	it('should return positive integer', () => {
		expect(
			getValue({
				distanceToEdge: 90,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(1);

		expect(
			getValue({
				distanceToEdge: 80,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(3);

		expect(
			getValue({
				distanceToEdge: 70,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(6);

		expect(
			getValue({
				distanceToEdge: 50,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(15);

		expect(
			getValue({
				distanceToEdge: 35,
				thresholds: { startScrollingFrom: 100, maxScrollValueAt: 30 },
			}),
		).toEqual(25);
	});
});
