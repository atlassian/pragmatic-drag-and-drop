import { useState } from 'react';

import { batchUpdatesForReact16 } from '../utils/batch-updates-for-react-16';

type Callback = () => void;

type Scheduler = {
	/**
	 * Queues the provided function to be called asynchronously.
	 */
	schedule(callback: Callback): void;

	/**
	 * Calls the queue of functions synchronously, and cancels the pending timeouts.
	 */
	flush(): void;
};

type Queue =
	| { status: 'idle' }
	| {
			status: 'pending';
			timeoutId: ReturnType<typeof setTimeout>;
			items: Callback[];
	  };

const idleQueue: Queue = { status: 'idle' };

function createScheduler(): Scheduler {
	let queue: Queue = idleQueue;

	const schedule = (callback: Callback) => {
		/**
		 * If the queue is currently idle (no update scheduled) then
		 * we should call `setTimeout` to schedule an update.
		 */
		if (queue.status === 'idle') {
			queue = {
				status: 'pending',
				timeoutId: setTimeout(flush, 0),
				items: [],
			};
		}

		queue.items.push(callback);
	};

	const flush = () => {
		if (queue.status === 'idle') {
			return;
		}

		/**
		 * Clearing the timeout optimistically in case `flush` was called directly.
		 */
		clearTimeout(queue.timeoutId);
		/**
		 * A shallow copy is used so that updates which queue further updates
		 * are not batched together. This is to more closely match rbd.
		 */
		const items = Array.from(queue.items);
		/**
		 * The queue is made idle so it is ready to schedule further updates.
		 */
		queue = idleQueue;

		/**
		 * Scheduled callbacks are batched.
		 *
		 * The batching is more evident when the page is running more slowly.
		 */
		batchUpdatesForReact16(() => {
			items.forEach((callback) => callback());
		});
	};

	return { schedule, flush };
}

/**
 * Used to schedule callbacks inside of a `setTimeout(fn, 0)`.
 *
 * This is used to match the behavior and timings of `react-beautiful-dnd`.
 */
export function useScheduler(): Scheduler {
	const [scheduler] = useState(createScheduler);
	return scheduler;
}
