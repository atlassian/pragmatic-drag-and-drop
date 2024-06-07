import * as liveRegion from '../../src';

import { getLiveRegion } from './_utils';

describe('DOM node', () => {
	it('should have role="alert"', () => {
		liveRegion.announce('a message');
		expect(getLiveRegion()).toHaveAttribute('role', 'alert');
	});
});
