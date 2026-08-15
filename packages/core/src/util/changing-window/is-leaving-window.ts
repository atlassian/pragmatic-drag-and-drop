import { isFirefox } from '../is-firefox';
import { isSafari } from '../is-safari';

import { isFromAnotherWindow } from './is-from-another-window';
import { isLeavingWindowInSafari } from './is-leaving-window-in-safari';

export function isLeavingWindow({ dragLeave }: { dragLeave: DragEvent }): boolean {
	const { type, relatedTarget } = dragLeave;
	if (type !== 'dragleave') {
		return false;
	}

	if (isSafari()) {
		return isLeavingWindowInSafari({ dragLeave });
	}

	// Standard check: if going to `null` we are leaving the `window`
	if (relatedTarget == null) {
		return true;
	}

	/**
	 * 🦊 Exception: `iframe` in Firefox (`125.0`)
	 *
	 * Case 1: parent `window` → child `iframe`
	 * `dragLeave.relatedTarget` is element _inside_ the child `iframe`
	 * (foreign element)
	 *
	 * Case 2: child `iframe` → parent `window`
	 * `dragLeave.relatedTarget` is the `iframe` in the parent `window`
	 * (foreign element)
	 */

	if (isFirefox()) {
		return isFromAnotherWindow(relatedTarget);
	}

	/**
	 * 🌏 Exception: `iframe` in Chrome (`124.0`)
	 *
	 * Case 1: parent `window` → child `iframe`
	 * `dragLeave.relatedTarget` is the `iframe` in the parent `window`
	 *
	 * Case 2: child `iframe` → parent `window`
	 * `dragLeave.relatedTarget` is `null` *(standard check)*
	 */

	// Case 2
	// Using `instanceof` check as the element will be in the same `window`
	return relatedTarget instanceof HTMLIFrameElement;
}
