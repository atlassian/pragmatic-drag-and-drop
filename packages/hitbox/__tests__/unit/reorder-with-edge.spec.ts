import { reorderWithEdge } from '../../src/reorder-with-edge';

test('moving relative to self should do nothing', () => {
  expect(
    reorderWithEdge({
      list: ['A', 'B'],
      startIndex: 0,
      indexOfTarget: 0,
      closestEdgeOfTarget: 'right',
      axis: 'horizontal',
    }),
  ).toEqual(['A', 'B']);

  expect(
    reorderWithEdge({
      list: ['A', 'B'],
      startIndex: 0,
      indexOfTarget: 0,
      closestEdgeOfTarget: 'left',
      axis: 'horizontal',
    }),
  ).toEqual(['A', 'B']);

  expect(
    reorderWithEdge({
      list: ['A', 'B'],
      startIndex: 1,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'right',
      axis: 'horizontal',
    }),
  ).toEqual(['A', 'B']);

  expect(
    reorderWithEdge({
      list: ['A', 'B'],
      startIndex: 1,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'left',
      axis: 'horizontal',
    }),
  ).toEqual(['A', 'B']);
});

test('moving forward', () => {
  expect(
    reorderWithEdge({
      list: ['A', 'B', 'C'],
      // move A to left of B
      startIndex: 0,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'left',
      axis: 'horizontal',
    }),
    // results in no change
  ).toEqual(['A', 'B', 'C']);

  expect(
    reorderWithEdge({
      list: ['A', 'B', 'C'],
      // move A to right of B
      startIndex: 0,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'right',
      axis: 'horizontal',
    }),
  ).toEqual(['B', 'A', 'C']);
});

test('moving backwards', () => {
  expect(
    reorderWithEdge({
      list: ['A', 'B', 'C'],
      // move C to right of B
      startIndex: 2,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'right',
      axis: 'horizontal',
    }),
    // results in no change
  ).toEqual(['A', 'B', 'C']);

  expect(
    reorderWithEdge({
      list: ['A', 'B', 'C'],
      // move C to left of B
      startIndex: 2,
      indexOfTarget: 1,
      closestEdgeOfTarget: 'left',
      axis: 'horizontal',
    }),
  ).toEqual(['A', 'C', 'B']);
});
