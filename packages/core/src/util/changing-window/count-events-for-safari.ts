import { bindAll } from 'bind-event-listener';

import { isSafari } from '../is-safari';

/* For "dragenter" events, the browser should set `relatedTarget` to the previous element.
 * For external drag operations, our first "dragenter" event should have a `event.relatedTarget` of `null`.
 *
 *  Unfortunately in Safari `event.relatedTarget` is *always* set to `null`
 *  Safari bug: https://bugs.webkit.org/show_bug.cgi?id=242627
 *  To work around this we count "dragenter" and "dragleave" events */

// Using symbols for event properties so we don't clash with
// anything on the `event` object
const symbols = {
	isLeavingWindow: Symbol('leaving'),
	isEnteringWindow: Symbol('entering'),
};

export function isEnteringWindowInSafari({ dragEnter }: { dragEnter: DragEvent }): boolean {
	if (!isSafari()) {
		return false;
	}
	return dragEnter.hasOwnProperty(symbols.isEnteringWindow);
}

export function isLeavingWindowInSafari({ dragLeave }: { dragLeave: DragEvent }): boolean {
	if (!isSafari()) {
		return false;
	}
	return dragLeave.hasOwnProperty(symbols.isLeavingWindow);
}

(function fixSafari() {
	// Don't do anything when server side rendering
	if (typeof window === 'undefined') {
		return;
	}

	// rather than checking the userAgent for "jsdom" we can do this check
	// so that the check will be removed completely in production code
	if (process.env.NODE_ENV === 'test') {
		return;
	}

	if (!isSafari()) {
		return;
	}

	type State = {
		enterCount: number;
		isOverWindow: boolean;
	};

	function getInitialState(): State {
		return {
			enterCount: 0,
			isOverWindow: false,
		};
	}

	let state: State = getInitialState();

	function resetState() {
		state = getInitialState();
	}

	// These event listeners are bound _forever_ and _never_ removed
	// We don't bother cleaning up these event listeners (for now)
	// as this workaround is only for Safari

	// This is how the event count works:
	//
	// lift (+1 enterCount)
	// - dragstart(draggable) [enterCount: 0]
	// - dragenter(draggable) [enterCount: 1]
	// leaving draggable (+0 enterCount)
	// - dragenter(document.body) [enterCount: 2]
	// - dragleave(draggable) [enterCount: 1]
	// leaving window (-1 enterCount)
	// - dragleave(document.body) [enterCount: 0] {leaving the window}

	// Things to note:
	// - dragenter and dragleave bubble
	// - the first dragenter when entering a window might not be on `window`
	//   - it could be on an element that is pressed up against the window
	//   - (so we cannot rely on `event.target` values)

	bindAll(
		window,
		[
			{
				type: 'dragstart',
				listener: () => {
					state.enterCount = 0;
					// drag start occurs in the source window
					state.isOverWindow = true;
					// When a drag first starts it will also trigger a "dragenter" on the draggable element
				},
			},
			{
				type: 'drop',
				listener: resetState,
			},
			{
				type: 'dragend',
				listener: resetState,
			},
			{
				type: 'dragenter',
				listener: (event: DragEvent) => {
					if (!state.isOverWindow && state.enterCount === 0) {
						// Patching the `event` object
						// The `event` object is shared with all event listeners for the event
						(event as any)[symbols.isEnteringWindow] = true;
					}
					state.isOverWindow = true;
					state.enterCount++;
				},
			},
			{
				type: 'dragleave',
				listener: (event) => {
					state.enterCount--;
					if (state.isOverWindow && state.enterCount === 0) {
						// Patching the `event` object as it is shared with all event listeners
						// The `event` object is shared with all event listeners for the event
						(event as any)[symbols.isLeavingWindow] = true;
						state.isOverWindow = false;
					}
				},
			},
		],
		// using `capture: true` so that adding event listeners
		// in bubble phase will have the correct symbols
		{ capture: true },
	);
})();
