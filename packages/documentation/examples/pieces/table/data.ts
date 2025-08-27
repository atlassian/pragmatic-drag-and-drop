import { getPerson } from '../../data/people';

import type { Item, Status } from './types';

const status: Status[] = ['todo', 'in-progress', 'done'];

/**
 * Create a set of values that appears to be random, but are predictable based on a seed.
 * Using a simple approach as this is just for a demo
 */
function getStableValues({
	seed,
	min,
	max,
	length,
}: {
	seed: number;
	min: number;
	max: number;
	length: number;
}): number[] {
	const range = max - min + 1;

	return Array.from({ length }, (_, index) => {
		const value =
			// making everything a positive number
			Math.abs(
				// Each new integer provided to Math.sin(integer) gives a fairly different result.
				// (Even though you could plot them out and find a pattern over time)
				// Can be a decimal between -1 and 1
				Math.sin(seed + index),
			);
		return Math.floor(value * range) + min;
	});
}

export function getItems({ amount }: { amount: number }): Item[] {
	const statusIndexes = getStableValues({
		seed: 3,
		min: 0,
		max: status.length - 1,
		length: amount,
	});
	return Array.from({ length: amount }, (_, index) => {
		const statusIndex = statusIndexes[index];
		const id = `id:${index}`;
		return {
			id,
			description: `Generated description [${id}]`,
			status: status[statusIndex],
			assignee: getPerson(),
		};
	});
}
