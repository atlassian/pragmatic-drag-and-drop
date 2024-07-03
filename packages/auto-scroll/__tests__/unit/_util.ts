import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import {
	type CleanupFn,
	type DragLocation,
	type DragLocationHistory,
	type DropTargetRecord,
	type Input,
	type Position,
} from '@atlaskit/pragmatic-drag-and-drop/types';

import { type Axis, type Edge } from '../../src/internal-types';

export function getDefaultInput(overrides: Partial<Input> = {}): Input {
	const defaults: Input = {
		// user input
		altKey: false,
		button: 0,
		buttons: 0,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,

		// coordinates
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
	};

	return {
		...defaults,
		...overrides,
	};
}

export function appendToBody(...elements: Element[]): CleanupFn {
	elements.forEach((element) => {
		document.body.appendChild(element);
	});

	return function removeFromBody() {
		elements.forEach((element) => {
			document.body.removeChild(element);
		});
	};
}

export function getEmptyHistory(input: Input = getDefaultInput()): DragLocationHistory {
	const noWhere: DragLocation = {
		input,
		dropTargets: [],
	};

	return {
		initial: noWhere,
		previous: {
			dropTargets: noWhere.dropTargets,
		},
		current: noWhere,
	};
}

export function getInitialHistory(
	dropTargets: DropTargetRecord[],
	input: Input = getDefaultInput(),
): DragLocationHistory {
	const location: DragLocation = {
		input,
		dropTargets,
	};

	return {
		initial: location,
		current: location,
		previous: {
			dropTargets: [],
		},
	};
}

export function setBoundingClientRect(el: HTMLElement, rect: DOMRect): CleanupFn {
	const original = el.getBoundingClientRect;

	el.getBoundingClientRect = () => rect;
	return () => {
		el.getBoundingClientRect = original;
	};
}

export function tryGetRect(box: Partial<Parameters<typeof getRect>[0]>): DOMRect {
	const { top, right, bottom, left } = box;
	invariant(typeof top === 'number');
	invariant(typeof right === 'number');
	invariant(typeof bottom === 'number');
	invariant(typeof left === 'number');

	return getRect({ top, right, bottom, left });
}

export function getRect(box: {
	top: number;
	right: number;
	bottom: number;
	left: number;
}): DOMRect {
	return {
		top: box.top,
		right: box.right,
		bottom: box.bottom,
		left: box.left,
		// calculated
		height: box.bottom - box.top,
		width: box.right - box.left,
		x: box.left,
		y: box.top,
		toJSON: function () {
			return JSON.stringify(this);
		},
	};
}

// usage: const [A, B, C, D, F] = getElements();
export function getElements(tagName: keyof HTMLElementTagNameMap = 'div'): Iterable<HTMLElement> {
	const iterator = {
		next() {
			return {
				done: false,
				value: document.createElement(tagName),
			};
		},
		[Symbol.iterator]() {
			return iterator;
		},
	};
	return iterator;
}

/**
 * Returns a connected tree of elements
 * `[grandChild, parent, grandParent]`
 */
export function getBubbleOrderedTree(
	tagName: keyof HTMLElementTagNameMap = 'div',
): Iterable<HTMLElement> {
	let last: HTMLElement | null;
	const iterator = {
		next() {
			const element = document.createElement(tagName);

			if (last) {
				element.appendChild(last);
			}
			last = element;

			return {
				done: false,
				value: element,
			};
		},
		[Symbol.iterator]() {
			return iterator;
		},
	};
	return iterator;
}

export const userEvent = {
	lift(target: HTMLElement, input?: Partial<Input>) {
		const final: Input = { ...getDefaultInput(), ...input };
		// accurate representation of events:
		firePointer.down(target, final);
		firePointer.move(target, { ...final, clientX: final.clientX + 10 });

		// will fire `onGenerateDragPreview`
		fireEvent.dragStart(target, final);
		firePointer.cancel(target, final);

		// after an animation frame we fire `onDragStart`
		advanceTimersToNextFrame();
	},
	drop(target: Element) {
		fireEvent.drop(target);
	},
	cancel(target: Element = document.body) {
		// A "cancel" (drop on nothing, or pressing "Escape") will
		// cause a "dragleave" and then a "dragend"
		fireEvent.dragLeave(target);
		fireEvent.dragEnd(target);
	},
	leaveWindow() {
		fireEvent.dragLeave(document.documentElement, { relatedTarget: null });
	},
	startExternalDrag({ types, target = document.body }: { types: string[]; target?: Element }) {
		const event = new DragEvent('dragenter', {
			cancelable: true,
			bubbles: true,
		});
		for (const type of types) {
			// @ts-expect-error
			event.dataTransfer?.types.push(type);
		}
		target.dispatchEvent(event);
		advanceTimersToNextFrame();
	},
	rougePointerMoves() {
		// first 20 are ignored due to firefox issue
		// 21st pointermove will cancel a drag
		for (let i = 0; i < 21; i++) {
			fireEvent.pointerMove(document.body);
		}
	},
};

/** Cleanup function to unbind all event listeners */
export async function reset(): Promise<void> {
	// cleanup any pending drags
	fireEvent.dragEnd(window);

	// cleanup honey pot fix
	fireEvent.pointerMove(window);
}

export function getBubbleOrderedPath(path: Element[]): Element[] {
	const last = path[path.length - 1];
	// will happen if you pass in an empty array
	if (!last) {
		return path;
	}
	// exit condition: no more parents
	if (!last.parentElement) {
		return path;
	}
	// bubble ordered
	return getBubbleOrderedPath([...path, last.parentElement]);
}

export function setElementFromPointWithPath(path: Element[]): CleanupFn {
	const originalElementFromPoint = document.elementFromPoint;
	const originalElementsFromPoint = document.elementsFromPoint;

	document.elementsFromPoint = () => path;
	document.elementFromPoint = () => path[0] ?? null;

	return () => {
		document.elementFromPoint = originalElementFromPoint;
		document.elementsFromPoint = originalElementsFromPoint;
	};
}

export function setElementFromPoint(element: Element | null): CleanupFn {
	const path = element ? getBubbleOrderedPath([element]) : [];
	return setElementFromPointWithPath(path);
}

/** Release a pending scrollBy (they are scheduled for the next task) */
export function stepScrollBy() {
	jest.advanceTimersByTime(1);
}

let startTime: number | null = null;

/** Record the initial (mocked) system start time
 *
 * This is no longer needed once `jest.advanceTimersToNextFrame()` is available
 * https://github.com/jestjs/jest/pull/14598
 */
export function setStartSystemTime() {
	startTime = Date.now();
}

/** Step forward a single animation frame
 *
 * This is no longer needed once `jest.advanceTimersToNextFrame()` is available
 * https://github.com/jestjs/jest/pull/14598
 */
export function advanceTimersToNextFrame() {
	invariant(
		startTime != null,
		'Must call `setStartSystemTime` before using `advanceTimersToNextFrame()`',
	);

	// Stealing logic from sinon fake timers
	// https://github.com/sinonjs/fake-timers/blob/fc312b9ce96a4ea2c7e60bb0cccd2c604b75cdbd/src/fake-timers-src.js#L1102-L1105
	const timePassedInFrame = (Date.now() - startTime) % 16;
	const timeToNextFrame = 16 - timePassedInFrame;
	jest.advanceTimersByTime(timeToNextFrame);
}

type BasicElementArgs = {
	width: number;
	height: number;
	x?: number;
	y?: number;
	id?: string;
};
export function setupNestedScrollContainers(bubbleOrdered: BasicElementArgs[]): HTMLElement[] {
	// argument validation
	for (let i = 0; i < bubbleOrdered.length - 1; i++) {
		const current = bubbleOrdered[i];
		const parent = bubbleOrdered[i + 1];

		invariant(
			current.height >= parent.height,
			`validation error: a child's height (${current.height}) was bigger than it's parent (${current.height})`,
		);

		invariant(
			current.width >= parent.width,
			`validation error: a child's width (${current.width}) was bigger than it's parent (${current.width})`,
		);
	}

	type Item = { args: BasicElementArgs; element: HTMLElement };

	// Making all elements first so we can link everything correctly.
	const items: Item[] = bubbleOrdered.map(
		(args): Item => ({
			args,
			element: document.createElement('div'),
		}),
	);

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const parent: Item | undefined = items[i + 1];
		const isInnerMost = i === 0;

		// Establish parent relationship
		if (parent) {
			parent.element.appendChild(item.element);
		}

		// helpful for logging
		item.element.id = item.args.id ?? `element-index-${i}-in-${items.length - 1}`;

		Object.assign(item.element.style, {
			// enabling scrolling in both directions if not the inner most
			overflowX: isInnerMost ? undefined : 'auto',
			overflowY: isInnerMost ? undefined : 'auto',
			height: `${item.args.height}px`,
			width: `${item.args.width}px`,
		});

		item.element.getBoundingClientRect = () => {
			// for simplicity, all elements are currently drawn from 0,0
			const start: Position = {
				x: item.args.x ?? 0,
				y: item.args.y ?? 0,
			};
			const box = DOMRect.fromRect({
				x: start.x,
				y: start.y,
				width: item.args.width,
				height: item.args.height,
			});

			if (!parent) {
				return box;
			}

			// The border box of an element will be shifted by:
			// 1. the scroll of a parent
			// 2. changes in the x/y of the parent

			const parentRect = parent.element.getBoundingClientRect();

			// What is the difference between the original parent.getBoundingClientRect() and where it is now?
			// Given that we know an element is always starting at `x: 0, y: 0`, the value of `x` and `y` can
			// only have changed if a parent was scrolled
			const parentChange: Position = {
				x: parentRect.x,
				y: parentRect.y,
			};

			const shiftedByParents = DOMRect.fromRect({
				x: box.x - parent.element.scrollLeft + parentChange.x,
				y: box.y - parent.element.scrollTop + parentChange.y,
				width: box.width,
				height: box.height,
			});

			return shiftedByParents;
		};

		// scroll properties will be based on children
		// TODO: could find the maximum height of any child
		const child: Item | undefined = items[i - 1];

		Object.defineProperties(item.element, {
			scrollHeight: {
				value: child ? child.args.height : item.args.height,
				writable: false,
			},
			scrollWidth: {
				value: child ? child.args.width : item.args.width,
				writable: false,
			},
		});

		// Note: these only measure paddingBox, but we are
		// not currently using borders so we are all good
		Object.defineProperties(item.element, {
			clientHeight: {
				value: item.args.height,
				writable: false,
			},
			clientWidth: {
				value: item.args.width,
				writable: false,
			},
		});
	}

	return items.map((item) => item.element);
}

export function setupBasicScrollContainer({
	scrollContainer = { width: 1000, height: 1000 },
	child = { width: 10000, height: 10000 },
}: {
	scrollContainer?: { width: number; height: number };
	child?: { width: number; height: number };
} = {}): { parentScrollContainer: HTMLElement; child: HTMLElement } {
	const elements = setupNestedScrollContainers([child, scrollContainer]);
	return {
		child: elements[0],
		parentScrollContainer: elements[1],
	};
}

export type Point = Position & { label: string };
export function getInsidePoints(rect: DOMRect): Point[] {
	return [
		{ label: 'top left', x: rect.left, y: rect.top },
		{ label: 'top right', x: rect.right, y: rect.top },
		{ label: 'bottom right', x: rect.right, y: rect.bottom },
		{ label: 'bottom left', x: rect.left, y: rect.bottom },
		{
			label: 'center',
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		},
	];
}

export function getOutsidePoints(rect: DOMRect): Point[] {
	return [
		{ label: 'left of top left', x: rect.left - 1, y: rect.top },
		{ label: 'top of top left', x: rect.left, y: rect.top - 1 },
		{ label: 'right of top right', x: rect.right + 1, y: rect.top },
		{ label: 'top of top right', x: rect.right, y: rect.top - 1 },
		{ label: 'right of bottom right', x: rect.right + 1, y: rect.bottom },
		{ label: 'bottom of bottom right', x: rect.right, y: rect.bottom + 1 },
		{ label: 'left of bottom left', x: rect.left - 1, y: rect.bottom },
		{ label: 'bottom of bottom left', x: rect.left, y: rect.bottom + 1 },
	];
}

export const mainAxisForSide: { [T in Edge]: Axis } = {
	bottom: 'vertical',
	top: 'vertical',
	left: 'horizontal',
	right: 'horizontal',
};

export type AxisScroll = Record<Axis, number>;
export type AxisMovement = Record<Axis, boolean>;
export type Event = { type: string } & Partial<AxisMovement>;
export type Scenario = {
	label: string;
	startPosition: Position;
	endPosition: Position;
	expectedMovement: AxisMovement;
};

export function getScenarios(rect: DOMRect, offset: number = 0): Scenario[] {
	return [
		{
			label: 'top left',
			startPosition: {
				x: rect.left,
				y: rect.top,
			},
			endPosition: {
				x: rect.left - offset,
				y: rect.top - offset,
			},
			expectedMovement: { horizontal: true, vertical: true },
		},
		{
			label: 'top',
			startPosition: {
				x: rect.left + rect.width / 2,
				y: rect.top,
			},
			endPosition: {
				x: rect.left + rect.width / 2,
				y: rect.top - offset,
			},
			expectedMovement: { horizontal: false, vertical: true },
		},
		{
			label: 'top right',
			startPosition: {
				x: rect.right,
				y: rect.top,
			},
			endPosition: {
				x: rect.right + offset,
				y: rect.top - offset,
			},
			expectedMovement: { horizontal: true, vertical: true },
		},
		{
			label: 'right',
			startPosition: {
				x: rect.right,
				y: rect.top + rect.height / 2,
			},
			endPosition: {
				x: rect.right + offset,
				y: rect.top + rect.height / 2,
			},
			expectedMovement: { horizontal: true, vertical: false },
		},
		{
			label: 'bottom right',
			startPosition: {
				x: rect.right,
				y: rect.bottom,
			},
			endPosition: {
				x: rect.right + offset,
				y: rect.bottom + offset,
			},
			expectedMovement: { horizontal: true, vertical: true },
		},
		{
			label: 'bottom',
			startPosition: {
				x: rect.left + rect.width / 2,
				y: rect.bottom,
			},
			endPosition: {
				x: rect.left + rect.width / 2,
				y: rect.bottom + offset,
			},
			expectedMovement: { horizontal: false, vertical: true },
		},
		{
			label: 'bottom left',
			startPosition: {
				x: rect.left,
				y: rect.bottom,
			},
			endPosition: {
				x: rect.left - offset,
				y: rect.bottom + offset,
			},
			expectedMovement: { horizontal: true, vertical: true },
		},
		{
			label: 'left',
			startPosition: {
				x: rect.left,
				y: rect.top + rect.height / 2,
			},
			endPosition: {
				x: rect.left - offset,
				y: rect.top + rect.height / 2,
			},
			expectedMovement: { horizontal: true, vertical: false },
		},
	];
}

export function getAxisScroll(container: HTMLElement): AxisScroll {
	return {
		horizontal: container.scrollLeft,
		vertical: container.scrollTop,
	};
}

export function hasAxisScrolled(container: HTMLElement, previousScroll: AxisScroll): AxisMovement {
	return {
		horizontal: container.scrollLeft !== previousScroll.horizontal,
		vertical: container.scrollTop !== previousScroll.vertical,
	};
}

export function isExpectingScrollEvent(movement: AxisMovement): boolean {
	return Object.values(movement).some(Boolean);
}

export function getExpectedEvents(movement: AxisMovement): Event[] {
	return isExpectingScrollEvent(movement)
		? [
				{
					type: 'scroll event',
					...movement,
				},
			]
		: [];
}

export const firePointer = (() => {
	type TTarget = Element | Window | Document;
	function makeDispatch(eventName: string) {
		return function dispatch(target: TTarget, input: Partial<Input> = {}) {
			const inputWithDefaults = {
				...getDefaultInput(),
				...input,
			};
			target.dispatchEvent(
				new MouseEvent(eventName, {
					bubbles: true,
					cancelable: true,
					...inputWithDefaults,
				}),
			);
		};
	}

	return {
		down: makeDispatch('pointerdown'),
		up: makeDispatch('pointerup'),
		move: makeDispatch('pointermove'),
		cancel: makeDispatch('pointercancel'),
	};
})();
