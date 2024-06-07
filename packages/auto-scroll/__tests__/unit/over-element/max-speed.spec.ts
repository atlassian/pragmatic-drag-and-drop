import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { autoScrollForElements } from '../../../src/entry-point/element';
import { getInternalConfig } from '../../../src/shared/configuration';
import { appendToBody, reset, setElementFromPointToBe, setupBasicScrollContainer } from '../_util';

// need to use "legacy" timers so we can control
// the exact amount of time that passes for a frame.
// For "modern" jest timers, the frame rate is locked at 60fps
jest.useFakeTimers('legacy');

const startTime = 0;
let currentTime: number = startTime;
jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

beforeEach(reset);

beforeEach(() => {
	// @ts-expect-error: raf-stub
	requestAnimationFrame.reset();
	currentTime = startTime;
});

function stepFrame({ frameDuration }: { frameDuration: number }) {
	currentTime += frameDuration;
	// @ts-expect-error: raf-stub
	requestAnimationFrame.step(1, frameDuration);
}

function stepScrollBy() {
	// setTimeout(fn, 0) is released by `jest.advanceTimersByTime(0)` for "legacy" timers
	jest.advanceTimersByTime(0);
}

const defaultConfig = getInternalConfig();

it('should not scroll faster than the target 60fps scroll change on higher frame rate devices', () => {
	const frameDuration120fps = 1000 / 120;

	const { child, parentScrollContainer } = setupBasicScrollContainer({
		child: { height: 10000, width: 10000 },
		scrollContainer: { height: 500, width: 500 },
	});
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push('scroll event');
			},
		}),
	);

	fireEvent.dragStart(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});
	// @ts-expect-error: raf-stub
	requestAnimationFrame.step(1, frameDuration120fps);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame after starting, the auto scrolling will be collecting how long the frame took
	// but there will be no scroll
	stepFrame({ frameDuration: frameDuration120fps });
	stepScrollBy();
	expect(ordered).toEqual([]);

	// Second frame: an auto scroll will occur
	stepFrame({ frameDuration: frameDuration120fps });
	stepScrollBy();
	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	// ensure time dampening is finished
	{
		const loopStartTime = Date.now();
		const hit = jest.fn();
		while (Date.now() - loopStartTime <= defaultConfig.timeDampeningDurationMs) {
			hit();
			stepFrame({ frameDuration: frameDuration120fps });
			stepScrollBy();
			expect(ordered).toEqual(['scroll event']);
			ordered.length = 0;
		}
		expect(hit).toHaveBeenCalled();
	}
	const before = {
		scrollTop: parentScrollContainer.scrollTop,
		now: Date.now(),
	};
	stepFrame({ frameDuration: frameDuration120fps });
	stepScrollBy();
	const after = {
		scrollTop: parentScrollContainer.scrollTop,
		now: Date.now(),
	};
	// a scroll occurred
	expect(ordered).toEqual(['scroll event']);
	// slower than the 60fps speed
	expect(after.scrollTop - before.scrollTop).toBeLessThan(
		(defaultConfig.maxPixelScrollPerSecond / 1000) * 60,
	);
	// adjusted the speed for 120fps
	const targetScrollPerMs = defaultConfig.maxPixelScrollPerSecond / 1000;
	expect(after.scrollTop - before.scrollTop).toBe(
		Math.ceil(targetScrollPerMs * frameDuration120fps),
	);

	cleanup();
});

it('should not make a scroll change bigger than the target 60fps scroll change when running at lower than 60fps', () => {
	const frameDuration30fps = 1000 / 30;

	const { child, parentScrollContainer } = setupBasicScrollContainer({
		child: { height: 10000, width: 10000 },
		scrollContainer: { height: 500, width: 500 },
	});
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
		}),
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push('scroll event');
			},
		}),
	);

	fireEvent.dragStart(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});
	stepFrame({ frameDuration: frameDuration30fps });

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame after starting, the auto scrolling will be collecting how long the frame took
	// but there will be no scroll
	stepFrame({ frameDuration: frameDuration30fps });
	stepScrollBy();
	expect(ordered).toEqual([]);

	// Second frame: an auto scroll will occur
	stepFrame({ frameDuration: frameDuration30fps });
	stepScrollBy();
	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	// ensure time dampening is finished
	{
		const loopStartTime = Date.now();
		const hit = jest.fn();
		while (Date.now() - loopStartTime <= defaultConfig.timeDampeningDurationMs) {
			hit();
			stepFrame({ frameDuration: frameDuration30fps });
			stepScrollBy();
			expect(ordered).toEqual(['scroll event']);
			ordered.length = 0;
		}
		expect(hit).toHaveBeenCalled();
	}

	const before = {
		scrollTop: parentScrollContainer.scrollTop,
		now: Date.now(),
	};
	stepFrame({ frameDuration: frameDuration30fps });
	stepScrollBy();
	const after = {
		scrollTop: parentScrollContainer.scrollTop,
		now: Date.now(),
	};
	// a scroll occurred
	expect(ordered).toEqual(['scroll event']);
	// the same scroll change as if scrolling at 60fps

	const targetScrollPerMs = defaultConfig.maxPixelScrollPerSecond / 1000;
	const frameDuration60fps = 1000 / 60;
	// Accounting for javascript precision inaccuracy caused by `1000 / 60`
	expect(after.scrollTop - before.scrollTop).toBeCloseTo(targetScrollPerMs * frameDuration60fps, 1);

	cleanup();
});

it('should allow the max speed to be configured', () => {
	const frameDuration60fps = 1000 / 60;
	const config = getInternalConfig({ maxScrollSpeed: 'fast' });
	let maxScrollSpeed: 'fast' | 'standard' = 'fast';

	// validation that our scroll speed will be faster
	expect(config.maxPixelScrollPerSecond).toBeGreaterThan(defaultConfig.maxPixelScrollPerSecond);

	const { child, parentScrollContainer } = setupBasicScrollContainer({
		child: { height: 10000, width: 10000 },
		scrollContainer: { height: 500, width: 500 },
	});
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(parentScrollContainer),
		draggable({
			element: child,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		dropTargetForElements({
			element: child,
			onDragStart: () => ordered.push('dropTarget:start'),
		}),
		autoScrollForElements({
			element: parentScrollContainer,
			getConfiguration: () => ({
				maxScrollSpeed,
			}),
		}),
		setElementFromPointToBe(child),
		bind(parentScrollContainer, {
			type: 'scroll',
			listener() {
				ordered.push('scroll event');
			},
		}),
	);

	fireEvent.dragStart(child, {
		clientX:
			parentScrollContainer.getBoundingClientRect().left +
			parentScrollContainer.getBoundingClientRect().width / 2,
		clientY: parentScrollContainer.getBoundingClientRect().bottom,
	});
	// @ts-expect-error: raf-stub
	requestAnimationFrame.step(1, frameDuration60fps);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
	ordered.length = 0;

	// on first frame after starting, the auto scrolling will be collecting how long the frame took
	// but there will be no scroll
	stepFrame({ frameDuration: frameDuration60fps });
	stepScrollBy();
	expect(ordered).toEqual([]);

	// Second frame: an auto scroll will occur
	stepFrame({ frameDuration: frameDuration60fps });
	stepScrollBy();
	expect(ordered).toEqual(['scroll event']);
	ordered.length = 0;

	// ensure time dampening is finished
	{
		const loopStartTime = Date.now();
		const hit = jest.fn();
		while (Date.now() - loopStartTime <= defaultConfig.timeDampeningDurationMs) {
			hit();
			stepFrame({ frameDuration: frameDuration60fps });
			stepScrollBy();
			expect(ordered).toEqual(['scroll event']);
			ordered.length = 0;
		}
		expect(hit).toHaveBeenCalled();
	}

	{
		const before = {
			scrollTop: parentScrollContainer.scrollTop,
		};
		stepFrame({ frameDuration: frameDuration60fps });
		stepScrollBy();
		const after = {
			scrollTop: parentScrollContainer.scrollTop,
		};
		// a scroll occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// running at maximum "fast" speed
		const targetScrollPerMs = config.maxPixelScrollPerSecond / 1000;
		expect(after.scrollTop - before.scrollTop).toBeCloseTo(
			// Accounting for javascript precision inaccuracy caused by:
			// - `1000 / 60`
			// - `after.scrollTop - before.scrollTop`
			targetScrollPerMs * frameDuration60fps,
			1,
		);
	}
	// changing from "fast" to "standard" scroll speed during a drag
	{
		maxScrollSpeed = 'standard';
		const before = {
			scrollTop: parentScrollContainer.scrollTop,
		};
		stepFrame({ frameDuration: frameDuration60fps });
		stepScrollBy();
		const after = {
			scrollTop: parentScrollContainer.scrollTop,
		};
		// a scroll occurred
		expect(ordered).toEqual(['scroll event']);
		ordered.length = 0;

		// running at maximum "standard" speed
		const targetScrollPerMs = defaultConfig.maxPixelScrollPerSecond / 1000;
		expect(after.scrollTop - before.scrollTop).toBeCloseTo(
			// Accounting for javascript precision inaccuracy caused by:
			// - `1000 / 60`
			// - `after.scrollTop - before.scrollTop`
			targetScrollPerMs * frameDuration60fps,
			1,
		);
	}

	cleanup();
});
