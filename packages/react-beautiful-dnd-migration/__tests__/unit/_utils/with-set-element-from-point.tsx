import { setElementFromPoint } from '../_util';

export function withSetElementFromPoint(dragHandle: HTMLElement, callback: Function): void {
	const clearElementFromPoint = setElementFromPoint(dragHandle);

	callback();

	clearElementFromPoint();
}
