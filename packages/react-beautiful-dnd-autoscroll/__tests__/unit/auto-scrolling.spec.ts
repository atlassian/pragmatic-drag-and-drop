import { replaceRaf, type Stub } from 'raf-stub';

import { autoScroller } from '../../src';
import config from '../../src/internal/config';
import { minScroll } from '../../src/internal/constants';

import { combine, getDefaultInput, getRect } from './_util';

describe('autoScroller', () => {
	replaceRaf();

	const requestAnimationFrame = window.requestAnimationFrame as any as Stub;
	const maxScroll = config.maxPixelScroll;
	const scrollElement = jest.fn();
	const scrollWindow = jest.fn();

	/*
    Container: 100px x 100px
    Example: vertical auto scrolling
    |----------------------------------|
    |  maxScrollValueAt (5px)          | => max scroll value in this range
    |----------------------------------|
    |  startScrollingFrom (25px)       |
    |----------------------------------|
    |                                  |
    |                                  | => no scroll in this range
    |                                  |
    |----------------------------------|
    |  startScrollingFrom (75px)       | => increased scroll value the closer to maxScrollValueAt
    |----------------------------------|
    |   maxScrollValueAt (95px)        | => max scroll value in this range
    |----------------------------------|
  */
	const setScrollableMock = (currentScrollY = 0) => {
		const clientWidth = 200;
		const clientHeight = 200;
		const defaultScroll = {
			current: { x: 0, y: currentScrollY },
			max: { x: 500, y: 500 },
		};
		const scrollableRect = { top: 0, bottom: 100, left: 0, right: 100 };
		const scrollableMock = document.createElement('div');
		scrollableMock.style.overflowX = 'auto';
		scrollableMock.scrollBy = scrollElement;
		scrollableMock.getBoundingClientRect = () => getRect(scrollableRect);
		scrollableMock.scrollLeft = defaultScroll.current.x;
		scrollableMock.scrollTop = defaultScroll.current.y;

		const scrollWidthSpy = jest
			.spyOn(scrollableMock, 'scrollWidth', 'get')
			.mockImplementation(() => defaultScroll.max.x + clientWidth);
		const scrollHeightSpy = jest
			.spyOn(scrollableMock, 'scrollHeight', 'get')
			.mockImplementation(() => defaultScroll.max.y + clientHeight);
		const clientWidthSpy = jest
			.spyOn(scrollableMock, 'clientWidth', 'get')
			.mockImplementation(() => clientWidth);
		const clientHeightSpy = jest
			.spyOn(scrollableMock, 'clientHeight', 'get')
			.mockImplementation(() => clientHeight);

		const originalElementFromPoint = document.elementFromPoint;
		document.elementFromPoint = () => scrollableMock;

		return () => {
			document.elementFromPoint = originalElementFromPoint;

			scrollWidthSpy.mockReset();
			scrollHeightSpy.mockReset();
			clientWidthSpy.mockReset();
			clientHeightSpy.mockReset();
		};
	};

	const tick = (timeIncrease: number = 0) => {
		Date.now = () => timeIncrease;
		requestAnimationFrame.step();
	};

	const setDateNowMock = () => {
		const originalNow = Date.now;
		Date.now = () => 0;

		return () => {
			Date.now = originalNow;
			requestAnimationFrame.reset();
		};
	};

	const setWindowScrollMock = () => {
		const originalWindowScrollBy = window.scrollBy;
		window.scrollBy = scrollWindow;
		return () => {
			window.scrollBy = originalWindowScrollBy;
		};
	};

	const setViewportMock = (scrollHeight = 500) => {
		const doc = document.createElement('document');

		const clientWidthSpy = jest.spyOn(doc, 'clientWidth', 'get').mockImplementation(() => 100);
		const clientHeightSpy = jest.spyOn(doc, 'clientHeight', 'get').mockImplementation(() => 100);
		const scrollWidthSpy = jest.spyOn(doc, 'scrollWidth', 'get').mockImplementation(() => 500);
		const scrollHeightSpy = jest
			.spyOn(doc, 'scrollHeight', 'get')
			.mockImplementation(() => scrollHeight);
		const documentSpy = jest
			.spyOn(document, 'documentElement', 'get')
			.mockImplementation(() => doc);

		return () => {
			scrollWidthSpy.mockReset();
			scrollHeightSpy.mockReset();
			clientWidthSpy.mockReset();
			clientHeightSpy.mockReset();
			documentSpy.mockReset();
		};
	};

	const scenarios = [
		{
			name: 'scrollElement',
			target: 'closestScrollable',
			setupMocks: () => combine(setScrollableMock(), setDateNowMock()),
			scrollMock: scrollElement,
		},
		{
			name: 'scrollWindow',
			target: 'window',
			setupMocks: () =>
				combine(setScrollableMock(), setDateNowMock(), setWindowScrollMock(), setViewportMock()),
			scrollMock: scrollWindow,
		},
	];

	afterAll(() => {
		requestAnimationFrame.reset();
	});

	scenarios.forEach((scenario) => {
		describe(scenario.name, () => {
			let cleanup = () => {};

			beforeEach(() => {
				cleanup = scenario.setupMocks();
			});

			afterEach(() => {
				jest.resetAllMocks();
				autoScroller.stop();
				cleanup();
			});

			const scroll = scenario.scrollMock;

			it(`should not scroll ${scenario.target} on start()`, () => {
				autoScroller.start({ input: getDefaultInput() });
				expect(scroll).toHaveBeenCalledTimes(0);
			});

			describe('start/stop API methods', () => {
				it(`should not scroll ${scenario.target} if stop() is called in the same frame`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 75 },
					});
					autoScroller.stop();
					tick();

					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should scroll ${scenario.target} in every rAf frame until stop() is called`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 75 },
					}); // nothing

					tick(); // 1st
					tick(); // 2nd
					tick(); // 3rd
					autoScroller.stop();
					tick(); // nothing

					expect(scroll).toHaveBeenCalledTimes(3);
				});
			});

			describe('vertical scrolling scenarios', () => {
				it(`should not scroll ${scenario.target} if element is lifted in the middle`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 50 },
					});
					tick();

					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should not scroll ${scenario.target} if element is lifted 1px before the boundary of the scrollable area`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 74 },
					});
					tick();

					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should not scroll ${scenario.target} if element is lifted in the middle and moved 1px before the boundary`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 50 },
					});
					tick();
					expect(scroll).toHaveBeenCalledTimes(0);
					autoScroller.updateInput({
						input: { ...getDefaultInput(), clientX: 50, clientY: 74 },
					});
					tick();
					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should scroll ${scenario.target} by min value if element is lifted at the boundary of the scrollable area`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 75 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, 0, minScroll);
				});

				it(`should scroll ${scenario.target} by some amount if element is lifted in the scrollable area, after time dampening is finished`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, 0, 7);
				});

				it(`should scroll ${scenario.target} by max value if element is lifted close to the edge of the scrollable area after time dampening is finished`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 95 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, 0, config.maxPixelScroll);
				});

				describe('time dampening', () => {
					it('should not dampen scrolling when lifted outside of the scrollable area', () => {
						autoScroller.start({
							input: { ...getDefaultInput(), clientX: 50, clientY: 50 },
						});
						tick();
						expect(scroll).toHaveBeenCalledTimes(0);
						autoScroller.updateInput({
							input: { ...getDefaultInput(), clientX: 50, clientY: 95 },
						});
						tick();
						expect(scroll).toHaveBeenNthCalledWith(1, 0, maxScroll);

						tick(config.durationDampening.accelerateAt + 300);
						expect(scroll).toHaveBeenNthCalledWith(2, 0, maxScroll);

						tick(config.durationDampening.accelerateAt + 400);
						expect(scroll).toHaveBeenNthCalledWith(3, 0, maxScroll);

						tick(config.durationDampening.accelerateAt + 500);
						expect(scroll).toHaveBeenNthCalledWith(4, 0, maxScroll);
					});

					it('should accelerate scroll over time when element is lifted in the scrollable area', () => {
						autoScroller.start({
							input: { ...getDefaultInput(), clientX: 50, clientY: 95 },
						});
						tick();
						expect(scroll).toHaveBeenNthCalledWith(1, 0, 1);

						tick(config.durationDampening.accelerateAt + 300);
						expect(scroll).toHaveBeenNthCalledWith(2, 0, 4);

						tick(config.durationDampening.accelerateAt + 400);
						expect(scroll).toHaveBeenNthCalledWith(3, 0, 7);

						tick(config.durationDampening.accelerateAt + 500);
						expect(scroll).toHaveBeenNthCalledWith(4, 0, 10);
					});
				});
			});

			describe('horizontal scrolling scenarios', () => {
				it(`should not scroll ${scenario.target} if element is lifted 1px before the boundary of the scrollable area`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 74, clientY: 50 },
					});
					tick();

					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should not scroll ${scenario.target} if element is lifted in the middle and moved 1px before the boundary`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 50, clientY: 50 },
					});
					tick();
					expect(scroll).toHaveBeenCalledTimes(0);
					autoScroller.updateInput({
						input: { ...getDefaultInput(), clientX: 74, clientY: 50 },
					});
					tick();
					expect(scroll).toHaveBeenCalledTimes(0);
				});

				it(`should scroll ${scenario.target} by min value if element is lifted at the boundary of the scrollable area`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 75, clientY: 50 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, minScroll, 0);
				});

				it(`should scroll ${scenario.target} by some amount if element is lifted in the scrollable area, after time dampening is finished`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 85, clientY: 50 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, 7, 0);
				});

				it(`should scroll ${scenario.target} by max value if element is lifted close to the edge of the scrollable area after time dampening is finished`, () => {
					autoScroller.start({
						input: { ...getDefaultInput(), clientX: 95, clientY: 50 },
					});
					tick(config.durationDampening.stopDampeningAt);

					expect(scroll).toHaveBeenCalledTimes(1);
					expect(scroll).toHaveBeenNthCalledWith(1, config.maxPixelScroll, 0);
				});

				describe('time dampening', () => {
					it('should not dampen scrolling when lifted outside of the scrollable area', () => {
						autoScroller.start({
							input: { ...getDefaultInput(), clientX: 50, clientY: 50 },
						});
						tick();
						expect(scroll).toHaveBeenCalledTimes(0);
						autoScroller.updateInput({
							input: { ...getDefaultInput(), clientX: 95, clientY: 50 },
						});
						tick();
						expect(scroll).toHaveBeenNthCalledWith(1, maxScroll, 0);

						tick(config.durationDampening.accelerateAt + 300);
						expect(scroll).toHaveBeenNthCalledWith(2, maxScroll, 0);

						tick(config.durationDampening.accelerateAt + 400);
						expect(scroll).toHaveBeenNthCalledWith(3, maxScroll, 0);

						tick(config.durationDampening.accelerateAt + 500);
						expect(scroll).toHaveBeenNthCalledWith(4, maxScroll, 0);
					});

					it('should accelerate scroll over time when element is lifted in the scrollable area', () => {
						autoScroller.start({
							input: { ...getDefaultInput(), clientX: 95, clientY: 50 },
						});
						tick();
						expect(scroll).toHaveBeenNthCalledWith(1, 1, 0);

						tick(config.durationDampening.accelerateAt + 300);
						expect(scroll).toHaveBeenNthCalledWith(2, 4, 0);

						tick(config.durationDampening.accelerateAt + 400);
						expect(scroll).toHaveBeenNthCalledWith(3, 7, 0);

						tick(config.durationDampening.accelerateAt + 500);
						expect(scroll).toHaveBeenNthCalledWith(4, 10, 0);
					});
				});
			});
		});
	});

	describe('behavior', () => {
		let cleanup = () => {};

		const setupMocks = ({
			windowScrollHeight,
			containerScrollY,
		}: {
			windowScrollHeight?: number;
			containerScrollY?: number;
		}) => {
			cleanup = combine(
				setScrollableMock(containerScrollY),
				setDateNowMock(),
				setWindowScrollMock(),
				setViewportMock(windowScrollHeight),
			);
		};

		afterEach(() => {
			jest.resetAllMocks();
			autoScroller.stop();
			cleanup();
		});

		describe('window-then-container', () => {
			it('should normally scroll the window', () => {
				setupMocks({ windowScrollHeight: 500 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'window-then-container',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollWindow).toHaveBeenCalledTimes(1);
				expect(scrollElement).not.toHaveBeenCalled();
			});

			it('should scroll the container when the window cannot scroll', () => {
				setupMocks({ windowScrollHeight: 0 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'window-then-container',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollElement).toHaveBeenCalledTimes(1);
				expect(scrollWindow).not.toHaveBeenCalled();
			});
		});

		describe('container-then-window', () => {
			it('should normally scroll the container', () => {
				setupMocks({ containerScrollY: 0 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'container-then-window',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollElement).toHaveBeenCalledTimes(1);
				expect(scrollWindow).not.toHaveBeenCalled();
			});

			it('should scroll the window when the container cannot scroll', () => {
				setupMocks({ containerScrollY: 500 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'container-then-window',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollWindow).toHaveBeenCalledTimes(1);
				expect(scrollElement).not.toHaveBeenCalled();
			});
		});

		describe('window-only', () => {
			it('should normally scroll the window', () => {
				setupMocks({ windowScrollHeight: 500 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'window-only',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollWindow).toHaveBeenCalledTimes(1);
				expect(scrollElement).not.toHaveBeenCalled();
			});

			it('should not scroll the container when the window cannot scroll', () => {
				setupMocks({ windowScrollHeight: 0 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'window-only',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollWindow).not.toHaveBeenCalled();
				expect(scrollElement).not.toHaveBeenCalled();
			});
		});

		describe('container-only', () => {
			it('should normally scroll the container', () => {
				setupMocks({ containerScrollY: 0 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'container-only',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollElement).toHaveBeenCalledTimes(1);
				expect(scrollWindow).not.toHaveBeenCalled();
			});

			it('should not scroll the window when the container cannot scroll', () => {
				setupMocks({ containerScrollY: 500 });

				autoScroller.start({
					input: { ...getDefaultInput(), clientX: 50, clientY: 85 },
					behavior: 'container-only',
				});
				tick(config.durationDampening.stopDampeningAt);

				expect(scrollElement).not.toHaveBeenCalled();
				expect(scrollWindow).not.toHaveBeenCalled();
			});
		});
	});
});
