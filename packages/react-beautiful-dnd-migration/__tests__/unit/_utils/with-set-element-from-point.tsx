import { setElementFromPoint } from '../_util';

export function withSetElementFromPoint(dragHandle: HTMLElement, callback: Function) {
	const clearElementFromPoint = setElementFromPoint(dragHandle);

	callback();

	clearElementFromPoint();
}
