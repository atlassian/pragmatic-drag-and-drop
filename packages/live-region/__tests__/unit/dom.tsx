import { screen } from '@testing-library/dom';

import * as liveRegion from '../../src';

describe('DOM node', () => {
	beforeEach(() => {
		liveRegion.cleanup();
	});

	it('should have role="status"', () => {
		liveRegion.announce('a message');
		expect(screen.getByRole('status')).toBeInTheDocument();
	});
});
