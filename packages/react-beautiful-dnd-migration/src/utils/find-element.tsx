import { rbdInvariant } from '../drag-drop-context/rbd-invariant';

/**
 * Each fragment consists of an attribute name, with an optional value.
 */
type SelectorFragment = { attribute: string; value?: string };

/**
 * Joins selector fragments into a single selector.
 *
 * @example
 * getSelector(
 *   // If we care about the value of the attribute
 *   { attribute: 'my-attribute', value: 'my-value' },
 *   // If we only care about existence of the attribute
 *   { attribute: 'another-attribute' },
 * ) === '[my-attribute="my-value"][another-attribute]'
 */
function getSelector(...fragments: SelectorFragment[]): string {
	const parts = fragments.map(({ attribute, value }) => {
		if (value) {
			// `CSS.escape` is widely supported, the lint rule is wrong.
			// It avoids problems caused by some values which are not valid in
			// selectors.
			// eslint-disable-next-line compat/compat
			return `[${attribute}="${CSS.escape(value)}"]`;
		}
		return `[${attribute}]`;
	});

	return parts.join('');
}

/**
 * Queries an element based on the provided selector fragments.
 */
export function findElement(...fragments: SelectorFragment[]): HTMLElement | null {
	const selector = getSelector(...fragments);
	return document.querySelector(selector);
}

export function findElementAll(...fragments: SelectorFragment[]): HTMLElement[] {
	const selector = getSelector(...fragments);
	return Array.from(document.querySelectorAll(selector));
}

/**
 * Queries an element, ensuring it exists.
 */
export function getElement(...fragments: SelectorFragment[]): HTMLElement {
	const result = findElement(...fragments);
	rbdInvariant(result, 'There is a matching HTMLElement for selector ' + getSelector(...fragments));
	return result;
}
