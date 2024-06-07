import config from '../../../src/internal/config';
import { minScroll } from '../../../src/internal/constants';
import { dampenValueByTime } from '../../../src/internal/get-scroll/get-scroll-on-axis/dampen-value-by-time';

describe('dampenValueByTime()', () => {
	let mockNow: jest.Mock;
	let proposedScroll = 7;
	const dragStartTime = 0;
	const stopAt: number = config.durationDampening.stopDampeningAt;
	const accelerateAt: number = config.durationDampening.accelerateAt;

	const originalNow = Date.now;
	beforeEach(() => {
		mockNow = jest.fn().mockReturnValue(0);
		Date.now = mockNow;
	});

	afterEach(() => {
		mockNow.mockClear();
		Date.now = originalNow;
	});

	it('should not dampen scrolling when the time dampening period have finished', () => {
		mockNow.mockReturnValueOnce(stopAt);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(proposedScroll);

		mockNow.mockReturnValueOnce(stopAt + 10);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(proposedScroll);

		mockNow.mockReturnValueOnce(stopAt + 100);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(proposedScroll);
	});

	it('should return the minimum scroll up to the accelerate time threshold', () => {
		mockNow.mockReturnValueOnce(accelerateAt - 10);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(minScroll);

		mockNow.mockReturnValueOnce(accelerateAt - 5);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(minScroll);

		mockNow.mockReturnValueOnce(accelerateAt - 1);
		expect(dampenValueByTime(proposedScroll, dragStartTime)).toEqual(minScroll);
	});

	it('should accelerate the scroll value to the max speed as time continues', () => {
		mockNow.mockReturnValueOnce(accelerateAt + 100);
		expect(dampenValueByTime(10, dragStartTime)).toEqual(1);

		mockNow.mockReturnValueOnce(accelerateAt + 300);
		expect(dampenValueByTime(10, dragStartTime)).toEqual(2);

		mockNow.mockReturnValueOnce(accelerateAt + 500);
		expect(dampenValueByTime(10, dragStartTime)).toEqual(4);

		mockNow.mockReturnValueOnce(accelerateAt + 700);
		expect(dampenValueByTime(10, dragStartTime)).toEqual(7);

		mockNow.mockReturnValueOnce(stopAt - 1);
		expect(dampenValueByTime(10, dragStartTime)).toEqual(10);
	});
});
