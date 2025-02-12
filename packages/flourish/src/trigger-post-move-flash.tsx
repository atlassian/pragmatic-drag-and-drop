import { durations } from '@atlaskit/motion/durations';
import { token } from '@atlaskit/tokens';

/**
 * Runs a flash animation on the background color of the provided `element`.
 *
 * This animation should be used after an element has been reordered,
 * in order to highlight where the element has moved to.
 */
export function triggerPostMoveFlash(element: HTMLElement) {
	element.animate([{ backgroundColor: token('color.background.selected') }, {}], {
		duration: durations.large,
		/**
		 * This is equivalent to the browser default, but we are making it
		 * explicit to avoid relying on implicit behavior.
		 *
		 * This curve is not part of `@atlaskit/motion` but it was an intentional
		 * design decision to use this curve.
		 */
		easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
		iterations: 1,
	});
}
