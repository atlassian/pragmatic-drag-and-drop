import { once } from '../public-utils/once';

// Using `once` as the value won't change in a browser

/**
 * Returns `true` if the browser supports the Popover API (top-layer).
 *
 * When supported, elements with `popover="manual"` can be promoted to the
 * browser's top layer via `element.showPopover()`, which is more reliable
 * than `z-index` for ensuring an element renders above everything else.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
 */
export const supportsPopover: () => boolean = once(function supportsPopover(): boolean {
	return (
		typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function'
	);
});
