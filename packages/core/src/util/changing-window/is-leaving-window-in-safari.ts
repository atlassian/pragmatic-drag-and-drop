import { isSafari } from '../is-safari';

import { symbols } from './count-events-for-safari';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function isLeavingWindowInSafari({ dragLeave }: { dragLeave: DragEvent }): boolean {
	if (!isSafari()) {
		return false;
	}
	return dragLeave.hasOwnProperty(symbols.isLeavingWindow);
}
