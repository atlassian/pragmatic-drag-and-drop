import * as liveRegion from '../../src';

import { hasLiveRegion } from './_utils';

describe('cleanup', () => {
	it('should do nothing if a node does not exist', () => {
		const snapshot = document.documentElement.outerHTML;
		liveRegion.cleanup();
		expect(document.documentElement.outerHTML).toEqual(snapshot);
	});

	it('should remove the live region node if it exists', () => {
		liveRegion.announce('a message');
		liveRegion.cleanup();
		expect(hasLiveRegion()).toBe(false);
	});
});
