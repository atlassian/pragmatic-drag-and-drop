import { getReorderDestinationIndex } from '../../src/get-reorder-destination-index';

test('moving relative to self should do nothing', () => {
	expect(
		getReorderDestinationIndex({
			startIndex: 0,
			indexOfTarget: 0,
			closestEdgeOfTarget: 'right',
			axis: 'horizontal',
		}),
	).toEqual(0);

	expect(
		getReorderDestinationIndex({
			startIndex: 0,
			indexOfTarget: 0,
			closestEdgeOfTarget: 'left',
			axis: 'horizontal',
		}),
	).toEqual(0);

	expect(
		getReorderDestinationIndex({
			startIndex: 1,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'right',
			axis: 'horizontal',
		}),
	).toEqual(1);

	expect(
		getReorderDestinationIndex({
			startIndex: 1,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'left',
			axis: 'horizontal',
		}),
	).toEqual(1);
});

test('moving forward', () => {
	expect(
		getReorderDestinationIndex({
			// list: ['A', 'B', 'C'],
			// move A to left of B
			startIndex: 0,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'left',
			axis: 'horizontal',
		}),
		// results in no change: ['A', 'B', 'C']
	).toEqual(0);

	expect(
		getReorderDestinationIndex({
			// list: ['A', 'B', 'C'],
			// move A to right of B
			startIndex: 0,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'right',
			axis: 'horizontal',
		}),
		// A moved forward ['B', 'A', 'C']
	).toEqual(1);
});

test('moving backwards', () => {
	expect(
		getReorderDestinationIndex({
			// list: ['A', 'B', 'C'],
			// move C to right of B
			startIndex: 2,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'right',
			axis: 'horizontal',
		}),
		// results in no change: ['A', 'B', 'C']
	).toEqual(2);

	expect(
		getReorderDestinationIndex({
			// list: ['A', 'B', 'C'],
			// move C to left of B
			startIndex: 2,
			indexOfTarget: 1,
			closestEdgeOfTarget: 'left',
			axis: 'horizontal',
		}),
		// C moved ['A', 'C', 'B']
	).toEqual(1);
});
