import invariant from 'tiny-invariant';

const honeyPotSelector = '[data-pdnd-honey-pot]';

export function findHoneyPot(): Element | null {
	return document.querySelector(honeyPotSelector);
}

export function getHoneyPot(): HTMLElement {
	const possible = document.querySelectorAll(honeyPotSelector);
	invariant(possible.length !== 0, `No honey pot element found`);
	invariant(possible.length === 1, `Multiple honey pot elements found (expected 1)`);

	const [element] = possible;
	invariant(element instanceof HTMLElement, 'Honey pot is not a HTMLElement');
	return element;
}
