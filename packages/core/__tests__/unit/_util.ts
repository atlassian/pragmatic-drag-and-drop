import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import {
	type CleanupFn,
	type DragLocation,
	type DragLocationHistory,
	type DropTargetRecord,
	type Input,
} from '../../src/entry-point/types';
import { type NativeMediaType } from '../../src/internal-types';

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

export function getRect(box: {
	top: number;
	bottom: number;
	left: number;
	right: number;
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

export function setElementFromPoint(el: Element | null): CleanupFn {
	const original = document.elementFromPoint;

	document.elementFromPoint = () => el;

	return () => {
		document.elementFromPoint = original;
	};
}
/**
 *
 * @example const [A, B, C, D, E] = getElements('div');
 */
export function getElements<TagName extends keyof HTMLElementTagNameMap>(
	tagName: TagName,
): Iterable<HTMLElementTagNameMap[TagName]> {
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
 *
 * @example const [grandChild, parent, grandParent] = getBubbleOrderedTree();
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

type SimpleItem = { data: string; type: NativeMediaType } | File;
export function addItemsToEvent({ event, items }: { event: DragEvent; items: SimpleItem[] }): void {
	for (const item of items) {
		if (item instanceof File) {
			event.dataTransfer?.items.add(item);
			continue;
		}
		event.dataTransfer?.items.add(item.data, item.type);
	}
}

export const nativeDrag = {
	startExternal({ items, target = document.body }: { items: SimpleItem[]; target?: Element }) {
		const event = new DragEvent('dragenter', {
			cancelable: true,
			bubbles: true,
		});
		addItemsToEvent({ event, items });
		target.dispatchEvent(event);
		// @ts-expect-error
		requestAnimationFrame.step();
	},
	// making items and target required as they are needed for internal drags
	startInternal({ items, target }: { items: SimpleItem[]; target: Element }) {
		const event = new DragEvent('dragstart', {
			cancelable: true,
			bubbles: true,
		});
		addItemsToEvent({ event, items });
		target.dispatchEvent(event);
		// @ts-expect-error
		requestAnimationFrame.step();
	},
	startTextSelectionDrag({ element = document.body }: { element: Element }) {
		const text = getTextNode(element);

		const event = new DragEvent('dragstart', {
			cancelable: true,
			bubbles: true,
		});

		addItemsToEvent({
			event,
			items: [
				{ type: 'text/plain', data: element.textContent ?? '' },
				// TODO: should this be inner our outer HTML?
				{ type: 'text/html', data: element.innerHTML ?? '' },
			],
		});

		text.dispatchEvent(event);
		// @ts-expect-error
		requestAnimationFrame.step();
	},
	drop({
		items = [],
		target = document.body,
	}: {
		items?: SimpleItem[];
		target?: Element;
	}): DragEvent {
		const event = new DragEvent('drop', { cancelable: true, bubbles: true });
		addItemsToEvent({ event, items });
		target.dispatchEvent(event);
		return event;
	},
};

export function getTextNode(element: Element): Text {
	const text: Text | undefined = Array.from(element.childNodes).find(
		(node: Node): node is Text => node.nodeType === Node.TEXT_NODE,
	);
	invariant(text, `Could not find text element`);
	return text;
}

export const assortedNativeMediaTypes: NativeMediaType[] = [
	// common
	'text/html',
	'text/plain',
	'text/uri-list',

	// Internally, the type is stored as "files",
	// But the DataTransfer.types array value will be "Files"
	'files',

	// uncommon
	'text/css',
	'text/csv',
];

export const userEvent = {
	lift(target: HTMLElement, input?: Input) {
		// will fire `onGenerateDragPreview`
		fireEvent.dragStart(target, input);

		// after an animation frame we fire `onDragStart`
		// @ts-ignore
		requestAnimationFrame.step();
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

	// Cleaning up post-drop fix
	// Waiting for a microtask just incase the microtask queue has not been flushed by jest
	// [Discussion](https://twitter.com/alexandereardon/status/1635059194226446342)
	await 'microtask';
	fireEvent.pointerMove(window);
}
