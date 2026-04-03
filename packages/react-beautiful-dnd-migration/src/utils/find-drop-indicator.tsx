import { customAttributes } from './attributes';
import { findElement } from './find-element';

export function findDropIndicator(): HTMLElement | null {
	return findElement({
		attribute: customAttributes.dropIndicator,
	});
}
