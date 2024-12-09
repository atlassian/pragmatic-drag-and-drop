import { screen } from '@testing-library/dom';

import * as liveRegion from '../../src';

jest.useFakeTimers();

describe('cleanup', () => {
	it('should do nothing if a node does not exist', () => {
		const snapshot = document.documentElement.outerHTML;
		liveRegion.cleanup();
		expect(document.documentElement.outerHTML).toEqual(snapshot);
	});

	it('should remove the live region node if it exists', () => {
		liveRegion.announce('a message');
		liveRegion.cleanup();
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	// We might want to change this in the future, but this is capturing existing behavior
	it('should clear any pending messages', () => {
		liveRegion.announce('one message');
		liveRegion.cleanup();

		// The pending message is never announced
		jest.runAllTimers();
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
		expect(screen.queryByText('one message')).not.toBeInTheDocument();
	});
});
