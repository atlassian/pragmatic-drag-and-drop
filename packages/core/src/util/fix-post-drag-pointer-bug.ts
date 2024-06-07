import { bindAll } from 'bind-event-listener';

import type { DragLocation } from '../internal-types';

type CleanupFn = () => void;

/** Set a `style` property on a `HTMLElement`
 *
 * @returns a `cleanup` function to restore the `style` property to it's original state
 */
function setStyle(
	el: HTMLElement,
	{
		property,
		rule,
		priority = '',
	}: { property: string; rule: string; priority?: 'important' | '' },
): CleanupFn {
	const originalValue = el.style.getPropertyValue(property);
	const originalPriority = el.style.getPropertyPriority(property);
	el.style.setProperty(property, rule, priority);
	return function cleanup() {
		el.style.setProperty(property, originalValue, originalPriority);
	};
}

/**
 * Allow the user to continue to interact with the element their pointer is over at the end of the drag.
 * This is important to allow the user to be able to click, drag (etc) after they have finished a drag
 *
 * @returns a `cleanup` function to restore all elements under the users pointer to their original state
 */
function allowPointerEventsOnElementUnderPointer({
	current,
}: {
	current: DragLocation;
}): CleanupFn | null {
	const underUsersPointer = document.elementFromPoint(current.input.clientX, current.input.clientY);
	if (!(underUsersPointer instanceof HTMLElement)) {
		return null;
	}

	// Debug note: change from 'pointer-events: none' to 'background: green'
	// to get a better sense of what is being achieved
	return setStyle(underUsersPointer, {
		property: 'pointer-events',
		rule: 'auto',
		priority: 'important',
	});
}

function blockPointerEventsOnEverything(): CleanupFn {
	const element = document.createElement('style');
	// Adding a data attribute so to make it super clear to consumers
	// (and to our tests) what this temporary style tag is for
	element.setAttribute('pdnd-post-drag-fix', 'true');
	document.head.appendChild(element);

	// Debug note: change from 'pointer-events: none' to 'background: red'
	// to get a better sense of what is being achieved
	element.sheet?.insertRule('* { pointer-events: none !important; }');

	return function cleanup() {
		document.head.removeChild(element);
	};
}

/** 🔥🤮 Fix (Chrome, Safari and Firefox) bug where the element under where the user started dragging
 * (on the viewport) is entered into by the browser after a drag finishes ("drop" or "dragend")
 *
 * @description
 *
 * Block pointer events on all elements except for the specific element that pointer is currently over
 *
 * - [Visual explanation of bug](https://twitter.com/alexandereardon/status/1633614212873465856)
 * - [Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=410328)
 */
export function fixPostDragPointerBug({ current }: { current: DragLocation }) {
	// Queuing a microtask to give any opportunity for frameworks to update their UI in a microtask
	// Note: react@18 does standard state updates in a microtask
	// We do this so our `atDestination` gets the _actual_ element that is under the users pointer
	// at the end of the drag.
	queueMicrotask(() => {
		const undoUnderPointer = allowPointerEventsOnElementUnderPointer({
			current,
		});

		// This will also block pointer-events on the children of the element under the users pointer.
		// This is what we want. If the user drops on a container element we don't want the children
		// of the container to be incorrectly entered into
		const undoGlobalBlock = blockPointerEventsOnEverything();

		function cleanup() {
			unbindEvents();
			undoUnderPointer?.();
			undoGlobalBlock();
		}

		const unbindEvents = bindAll(
			window,
			[
				{ type: 'pointerdown', listener: cleanup },
				{ type: 'pointermove', listener: cleanup },
				{ type: 'focusin', listener: cleanup },
				{ type: 'focusout', listener: cleanup },

				// a 'pointerdown' should happen before 'dragstart', but just being super safe
				{ type: 'dragstart', listener: cleanup },

				// if the user has dragged something out of the window
				// and then is dragging something back into the window
				// the first events we will see are "dragenter" (and then "dragover").
				// So if we see any of these we need to clear the post drag fix.
				{ type: 'dragenter', listener: cleanup },
				{ type: 'dragover', listener: cleanup },
			],
			{
				// Using `capture` is more likely to not be impacted by consumers stopping events
				capture: true,
			},
		);
	});
}
