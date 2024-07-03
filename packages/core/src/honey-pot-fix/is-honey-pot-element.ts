import { honeyPotDataAttribute } from './honey-pot-data-attribute';

export function isHoneyPotElement(target: EventTarget | null): boolean {
	return target instanceof Element && target.hasAttribute(honeyPotDataAttribute);
}
