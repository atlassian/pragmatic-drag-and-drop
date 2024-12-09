import { screen } from '@testing-library/dom';

import * as liveRegion from '../../src';
import { announceDelay } from '../../src/constants';

jest.useFakeTimers();

describe('announce', () => {
	beforeEach(() => {
		liveRegion.cleanup();
	});

	it('should create a live region', () => {
		liveRegion.announce('a message');
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('should place the message inside of the live region after the announceDelay', () => {
		const msg = 'a message';
		liveRegion.announce(msg);
		const node = screen.getByRole('status');
		expect(node).not.toHaveTextContent(msg);
		jest.advanceTimersByTime(announceDelay);
		expect(node).toHaveTextContent(msg);
	});

	it('should reuse an existing live region', () => {
		liveRegion.announce('');
		const node = screen.getByRole('status');

		const msg1 = 'message #1';
		liveRegion.announce(msg1);
		jest.runOnlyPendingTimers();
		expect(node).toHaveTextContent(msg1);

		const msg2 = 'message #2';
		liveRegion.announce(msg2);
		jest.runOnlyPendingTimers();
		expect(node).toHaveTextContent(msg2);
	});

	it('should not create more than one node at a time', () => {
		liveRegion.announce('one message');
		liveRegion.announce('two message');
		liveRegion.announce('red message');
		liveRegion.announce('blue message');

		expect(screen.getAllByRole('status')).toHaveLength(1);
	});

	// We might want to change this in the future, but this is capturing existing behavior
	it('should use the latest message', () => {
		liveRegion.announce('first');
		liveRegion.announce('second');

		jest.advanceTimersByTime(announceDelay);
		expect(screen.getByRole('status')).toHaveTextContent('second');
	});

	// We might want to change this in the future, but this is capturing existing behavior
	it('should clear pending messages, but still wait the full announceDelay', () => {
		liveRegion.announce('first');

		setTimeout(() => {
			liveRegion.announce('second');
		}, announceDelay / 2);

		const node = screen.getByRole('status');

		jest.advanceTimersByTime(announceDelay);
		// The queued first message was cleared by the second before it was shown
		expect(node).not.toHaveTextContent('first');
		// There has not been a full `announceDelay` since the second message was queued
		expect(node).not.toHaveTextContent('second');

		// Advancing by the delay we used to queue the second message
		jest.advanceTimersByTime(announceDelay / 2);
		// Now there has been a complete `announceDelay` since the second message was queued
		expect(node).toHaveTextContent('second');
	});
});
