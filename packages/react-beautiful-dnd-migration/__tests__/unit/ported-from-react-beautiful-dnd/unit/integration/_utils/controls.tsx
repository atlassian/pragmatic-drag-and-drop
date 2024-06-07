// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/util/controls.js>

import { act, fireEvent } from '@testing-library/react';

import { setElementFromPoint } from '../../../../_util';

const sloppyClickThreshold = 5;

export type Control = {
	name: string;
	preLift: (handle: HTMLElement) => void;
	lift: (handle: HTMLElement) => void;
	move: (handle: HTMLElement) => void;
	drop: (handle: HTMLElement) => void;
	cancel: (handle: HTMLElement) => void;
};

export function simpleLift(control: Control, handle: HTMLElement) {
	control.preLift(handle);
	control.lift(handle);
}

export function getTransitionEnd(propertyName: string = 'transform'): Event {
	const event: Event = new Event('transitionend', {
		bubbles: true,
		cancelable: true,
	});
	// cheating and adding property to event as TransitionEvent constructor does not exist
	// @ts-expect-error - being amazing
	event.propertyName = propertyName;
	return event;
}

export function mouseLiftExtended(
	handle: HTMLElement,
	{ elementUnderPointer }: { elementUnderPointer: HTMLElement },
) {
	/**
	 * Added for compatibility with how pdnd checks drag handles.
	 */
	const clearElementFromPoint = setElementFromPoint(elementUnderPointer);

	// will fire `onGenerateDragPreview`
	fireEvent.dragStart(handle, {
		clientX: 0,
		clientY: sloppyClickThreshold,
	});

	act(() => {
		// after an animation frame we fire `onDragStart`
		// @ts-expect-error
		requestAnimationFrame.step();
	});

	clearElementFromPoint();
}

export const mouse: Control = {
	name: 'mouse',
	preLift: (handle: HTMLElement) => {
		fireEvent.mouseDown(handle);
	},
	lift: (handle: HTMLElement) => {
		mouseLiftExtended(handle, { elementUnderPointer: handle });
	},
	move: (handle: HTMLElement) => {
		fireEvent.pointerMove(handle, {
			clientX: 0,
			clientY: sloppyClickThreshold + 1,
		});

		// movements are throttled by raf
		act(() => {
			// @ts-expect-error
			requestAnimationFrame.step();
		});
	},
	drop: (handle: HTMLElement) => {
		fireEvent.drop(handle);
	},
	cancel: (handle: HTMLElement) => {
		fireEvent.dragEnd(handle);
	},
};

export const keyboard: Control = {
	name: 'keyboard',
	preLift: () => {},
	lift: (handle: HTMLElement) => {
		handle.focus();

		fireEvent.keyDown(handle, { key: ' ' });

		act(() => {
			// @ts-expect-error
			requestAnimationFrame.step();
		});
	},
	move: (handle: HTMLElement) => {
		fireEvent.keyDown(window, { key: 'ArrowDown' });
	},
	drop: (handle: HTMLElement) => {
		fireEvent.keyDown(window, { key: ' ' });
	},
	cancel: (handle: HTMLElement) => {
		fireEvent.keyDown(window, { key: 'Escape' });
	},
};

export const controls: Control[] = [mouse, keyboard];

export const forEachSensor = (tests: (control: Control) => void) => {
	controls.forEach((control: Control) => {
		describe(`with: ${control.name}`, () => {
			beforeEach(() => {
				jest.useFakeTimers();
			});
			afterEach(() => {
				jest.clearAllTimers();
				jest.useRealTimers();
			});
			tests(control);
		});
	});
};
