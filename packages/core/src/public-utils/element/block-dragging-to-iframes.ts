import { monitorForElements } from '../../adapter/element-adapter';
import { type CleanupFn } from '../../internal-types';
import { combine } from '../combine';

/**
 * Set a `style` property on a `HTMLElement`
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

let isActive: boolean = false;

/**
 * Start blocking dragging to iframes. Only to be called once a drag has started.
 */
function tryStart(): void {
	// There can technically be multiple registrations on the same element.
	// Adding a guard to ensure that only one registration does the blocking.
	if (isActive) {
		return;
	}

	isActive = true;

	// At this stage, we are also not watching for new iframe elements being added to the page
	// (we _could_ do that as a future change)
	const iframeCleanups = Array.from(document.querySelectorAll('iframe')).map((iframe) =>
		setStyle(iframe, { property: 'pointer-events', rule: 'none', priority: 'important' }),
	);

	// Not returning the cleanup function.
	// This code will clean itself up when the interaction ends in `onDrop()`.
	// Once a drag has started we are blocking iframes until the interaction is finished.
	const cleanup = combine(
		...iframeCleanups,
		// We only need this monitor for listening to the drop
		// as our monitor in `blockDraggingToIFrames()` will only
		// call this function when the drag has started
		monitorForElements({
			onDrop() {
				cleanup();
			},
		}),
		function release() {
			isActive = false;
		},
	);
}

/**
 * Block dragging of a draggable element to <iframe> elements.
 *
 * @description
 *
 * - This function sets `pointer-events:none !important` to all `<iframe>` elements for the duration of the drag.
 * - Once an `<iframe>` is disabled, it will only be re-enabled once the current drag interaction is completed (and not when the `CleanupFn` is called)
 * - This function currently does not watch for new `<iframe>` elements being adding during a drag operation.
 */
export function blockDraggingToIFrames({ element }: { element: HTMLElement }): CleanupFn {
	return monitorForElements({
		onGenerateDragPreview({ source }) {
			// only starting if we are dragging the provided element
			if (source.element === element) {
				tryStart();
			}
		},
	});
}
