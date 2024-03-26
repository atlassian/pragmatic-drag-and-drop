import { combine } from '../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '../../../src/entry-point/element/adapter';
import { appendToBody, getBubbleOrderedTree, reset, userEvent } from '../_util';

afterEach(reset);

test('drop targets and monitors should be notified of events even if they are mounted before the first draggable', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  // registering drop target and monitor before mounting first draggable (which kicks off the adapter)
  const cleanup = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
  );

  const cleanupDraggable = combine(
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // a little drag
  userEvent.lift(draggableEl);
  userEvent.drop(A);

  // all events are as we expected
  expect(ordered).toEqual([
    'draggable:start',
    'a:start',
    'monitor:start',
    'draggable:drop',
    'a:drop',
    'monitor:drop',
  ]);

  cleanup();
  cleanupDraggable();
});

test('drop targets and monitors should be notified of events even if draggable is unmounted mid drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  const cleanupDraggable = combine(
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );
  const cleanup = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
  );

  // a little drag
  userEvent.lift(draggableEl);

  // all events are as we expected
  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  // removing the original draggable which will cleanup the adapter
  cleanupDraggable();

  userEvent.drop(A);

  // all events are as we expected
  expect(ordered).toEqual([
    // Note: unmounted draggable `onDrop` is not called
    'a:drop',
    'monitor:drop',
  ]);

  cleanup();
  cleanupDraggable();
});
