import { isSafari } from '../is-safari';

import { symbols } from './count-events-for-safari';

export function isEnteringWindowInSafari({ dragEnter }: { dragEnter: DragEvent }): boolean {
	if (!isSafari()) {
		return false;
	}
	return dragEnter.hasOwnProperty(symbols.isEnteringWindow);
}
