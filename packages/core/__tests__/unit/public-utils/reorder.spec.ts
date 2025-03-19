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

it('should return a new array reference (populated array)', () => {
	const original: string[] = ['A', 'B'];

	const result = reorder({
		list: original,
		// Grab A
		startIndex: 0,
		// Move it to where B is
		finishIndex: 1,
	});

	// contents of original unchanged
	expect(original).toEqual(['A', 'B']);
	// new array was returned
	expect(original).not.toBe(result);
	// validating we got the result we expected
	expect(result).toEqual(['B', 'A']);
});

it('should return a new array reference (unpopulated array)', () => {
	const original: string[] = [];

	const result = reorder({
		list: original,
		startIndex: 0,
		finishIndex: 0,
	});

	// contents of original unchanged
	expect(original).toEqual([]);
	// new array was returned
	expect(original).not.toBe(result);
	// validating we got the result we expected
	expect(result).toEqual([]);
});

it('should return a new array reference (invalid index)', () => {
	const original: string[] = ['A', 'B'];

	const result = reorder({
		list: original,
		startIndex: -1,
		finishIndex: 1,
	});

	// contents of original unchanged
	expect(original).toEqual(['A', 'B']);
	// new array was returned
	expect(original).not.toBe(result);
	// validating we got the result we expected
	expect(result).toEqual(['A', 'B']);
});
