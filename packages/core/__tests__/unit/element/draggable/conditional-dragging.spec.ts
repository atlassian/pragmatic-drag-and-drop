import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
} from '../../../../src/entry-point/element/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  reset,
} from '../../_util';

afterEach(reset);

it('should be possible to opt out of a drag', () => {
  const [target] = getElements('div');
  const onGenerateDragPreview = jest.fn();
  const cleanup = combine(
    appendToBody(target),
    draggable({
      element: target,
      onGenerateDragPreview,
      canDrag: () => false,
    }),
  );

  fireEvent.dragStart(target);

  expect(onGenerateDragPreview).not.toHaveBeenCalled();

  cleanup();
});

it('should not drag a parent when child is opting out of a drag', () => {
  const [child, parent] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(parent),
    draggable({
      element: child,
      onGenerateDragPreview: () => ordered.push('child:preview'),
      canDrag: () => false,
    }),
    draggable({
      element: parent,
      onGenerateDragPreview: () => ordered.push('parent:preview'),
    }),
  );

  fireEvent.dragStart(child);

  expect(ordered).toEqual([]);

  cleanup();
});

it('should allow a parent to drag when a child opts out of dragging altogether!', () => {
  // This test doesn't really exercise much, but it does validate this:
  // https://twitter.com/alexandereardon/status/1531058393837752321
  const [parent] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(parent),
    draggable({
      element: parent,
      onGenerateDragPreview: () => ordered.push('parent:preview'),
    }),
  );

  fireEvent.dragStart(parent);

  expect(ordered).toEqual(['parent:preview']);

  cleanup();
});

it('should not try to collect draggable data when opting out of a drag', () => {
  const [target] = getElements('div');
  const onGenerateDragPreview = jest.fn();
  const getData = jest.fn();
  const cleanup = combine(
    appendToBody(target),
    draggable({
      element: target,
      onGenerateDragPreview,
      getInitialData: getData,
      canDrag: () => false,
    }),
  );

  fireEvent.dragStart(target);

  expect(getData).not.toHaveBeenCalled();
  expect(onGenerateDragPreview).not.toHaveBeenCalled();

  cleanup();
});

it('should not try to collect drop target data when opting out of a drag', () => {
  const [target] = getElements('div');
  const onGenerateDragPreview = jest.fn();
  const getDropTargetData = jest.fn();
  const cleanup = combine(
    appendToBody(target),
    draggable({
      element: target,
      onGenerateDragPreview,
      canDrag: () => false,
    }),
    dropTargetForElements({
      element: target,
      getData: getDropTargetData,
    }),
  );

  fireEvent.dragStart(target);

  expect(getDropTargetData).not.toHaveBeenCalled();
  expect(onGenerateDragPreview).not.toHaveBeenCalled();

  cleanup();
});
