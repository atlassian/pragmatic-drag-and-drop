import { reorder } from '../../../src/entry-point/reorder';

it('should reorder a list', () => {
	expect(
		reorder({
			list: ['A', 'B'],
			// no change
			startIndex: 1,
			finishIndex: 1,
		}),
	).toEqual(['A', 'B']);

	expect(
		reorder({
			list: ['A', 'B'],
			// Grab A
			startIndex: 0,
			// Move it to where B is
			finishIndex: 1,
		}),
	).toEqual(['B', 'A']);

	expect(
		reorder({
			list: ['A', 'B', 'C', 'D'],
			// Grab C
			startIndex: 2,
			// Move it to the start of the list
			finishIndex: 0,
		}),
	).toEqual(['C', 'A', 'B', 'D']);

	expect(
		reorder({
			list: ['A', 'B', 'C', 'D'],
			// Grab A
			startIndex: 0,
			// Move it to the end of the list
			finishIndex: 3,
		}),
	).toEqual(['B', 'C', 'D', 'A']);

	expect(
		reorder({
			list: ['A', 'B', 'C', 'D'],
			// Grab A
			startIndex: 0,
			// Move it to where C is
			finishIndex: 2,
		}),
	).toEqual(['B', 'C', 'A', 'D']);
});
