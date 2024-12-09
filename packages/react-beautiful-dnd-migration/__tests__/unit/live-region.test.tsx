import { screen } from '@testing-library/dom';

import * as liveRegion from '../../src/drag-drop-context/live-region';

describe('live region', () => {
	beforeEach(() => {
		liveRegion.cleanup();
	});

	describe('announce', () => {
		it('should create a live region with role="alert"', () => {
			liveRegion.announce('a message');
			expect(screen.getByRole('alert')).toHaveTextContent('a message');
		});

		it('should reuse an existing live region', () => {
			liveRegion.announce('');
			const node = screen.getByRole('alert');

			const msg1 = 'message #1';
			liveRegion.announce(msg1);
			expect(node).toHaveTextContent(msg1);

			const msg2 = 'message #2';
			liveRegion.announce(msg2);
			expect(node).toHaveTextContent(msg2);
		});

		it('should not create more than one node at a time', () => {
			liveRegion.announce('one message');
			liveRegion.announce('two message');
			liveRegion.announce('red message');
			liveRegion.announce('blue message');

			expect(screen.getAllByRole('alert')).toHaveLength(1);
		});
	});

	describe('cleanup', () => {
		it('should do nothing if a node does not exist', () => {
			const snapshot = document.documentElement.outerHTML;
			liveRegion.cleanup();
			expect(document.documentElement.outerHTML).toEqual(snapshot);
		});

		it('should remove the live region node if it exists', () => {
			liveRegion.announce('a message');
			liveRegion.cleanup();
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		});
	});
});
