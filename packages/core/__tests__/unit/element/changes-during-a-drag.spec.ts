import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  ElementEventPayloadMap,
  monitorForElements,
} from '../../../src/entry-point/element/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  reset,
  userEvent,
} from '../_util';

afterEach(reset);

test('adding a draggable during a drag', () => {
  const [A, B] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );

  userEvent.lift(A);
  expect(ordered).toEqual(['a:start']);
  ordered.length = 0;

  // this should not throw
  const cleanup2 = combine(
    appendToBody(B),
    draggable({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDropTargetChange: () => ordered.push('b:update'),
      onDrop: () => ordered.push('b:drop'),
    }),
  );

  fireEvent.dragEnter(B);
  expect(ordered).toEqual([]);

  userEvent.cancel(A);

  expect(ordered).toEqual(['a:drop']);

  cleanup();
  cleanup2();
});

test('removing the dragging item during a drag (drop)', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [X] = getElements('div');
  const ordered: string[] = [];
  const cleanupDropTargets = combine(
    appendToBody(A, X),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrop: () => ordered.push('a:drop'),
    }),
    dropTargetForElements({
      element: X,
      onDragStart: () => ordered.push('x:start'),
      onDropTargetChange: () => ordered.push('x:update'),
      onDragEnter: () => ordered.push('x:enter'),
      onDragLeave: () => ordered.push('x:leave'),
      onDrop: () => ordered.push('x:drop'),
    }),
  );
  const cleanupDraggable = combine(
    () => A.removeChild(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:update'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  userEvent.lift(draggableEl);
  expect(ordered).toEqual(['draggable:start', 'a:start']);
  ordered.length = 0;

  // nothing changed!
  expect(ordered).toEqual([]);

  // moving over B
  fireEvent.dragEnter(X);
  expect(ordered).toEqual([
    'draggable:update',
    'a:update',
    'a:leave',
    'x:update',
    'x:enter',
  ]);
  ordered.length = 0;

  // remove the draggable
  cleanupDraggable();

  userEvent.drop(X);

  expect(ordered).toEqual([
    // draggable is gone!
    // 'draggable:drop',
    'x:drop',
  ]);

  cleanupDropTargets();
});

test('removing the dragging item during a drag (cancel [looking a "pointermove"])', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanupDropTarget = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      getData: () => ({ id: 'A' }),
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );
  const cleanupMonitor = monitorForElements({
    onDragStart: () => ordered.push('monitor:start'),
    onDropTargetChange: () => ordered.push('monitor:change'),
    onDrop: () => ordered.push('monitor:drop'),
  });
  const cleanupDraggable = combine(
    () => A.removeChild(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  cleanupDraggable();

  // Note: `dragend` is not fired on the source element if it is removed from the DOM
  // `draggableEl` is no longer in the DOM so the event won't bubble anywhere
  expect(ordered).toEqual([]);

  // after some rouge pointer movements the drag will be killed for real
  userEvent.rougePointerMoves();

  expect(ordered).toEqual([
    // when a drag is canceled we first leave the current drop targets
    'a:change',
    'monitor:change',
    // the monitor will hear about the final drop event
    'monitor:drop',
  ]);

  cleanupDropTarget();
  cleanupMonitor();
});

test('removing the dragging item during a drag (cancel [looking a "pointerdown"])', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanupDropTarget = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      getData: () => ({ id: 'A' }),
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );
  const cleanupMonitor = monitorForElements({
    onDragStart: () => ordered.push('monitor:start'),
    onDropTargetChange: () => ordered.push('monitor:change'),
    onDrop: () => ordered.push('monitor:drop'),
  });
  const cleanupDraggable = combine(
    () => A.removeChild(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  cleanupDraggable();

  // Note: `dragend` is not fired on the source element if it is removed from the DOM
  // `draggableEl` is no longer in the DOM so the event won't bubble anywhere
  expect(ordered).toEqual([]);

  // if we see a "pointerdown" event we know the last drag is finished
  fireEvent.pointerDown(A);

  expect(ordered).toEqual([
    // when a drag is canceled we first leave the current drop targets
    'a:change',
    'monitor:change',
    // the monitor will hear about the final drop event
    'monitor:drop',
  ]);

  cleanupDropTarget();
  cleanupMonitor();
});

test('changing the dragging item during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanupDropTargets = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      onDragStart: ({ source }) =>
        ordered.push(`a:start[sourceId:${source.data.id}]`),
      onDrag: ({ source }) =>
        ordered.push(`a:drag[sourceId:${source.data.id}]`),
      onDrop: ({ source }) =>
        ordered.push(`a:drop[sourceId:${source.data.id}]`),
    }),
  );
  const cleanupDraggable1 = draggable({
    element: draggableEl,
    getInitialData: () => ({ id: '1' }),
    onDragStart: ({ source }) =>
      ordered.push(`draggable(1):start[sourceId:${source.data.id}]`),
    onDrag: ({ source }) =>
      ordered.push(`draggable(1):drag[sourceId:${source.data.id}]`),
    onDrop: ({ source }) =>
      ordered.push(`draggable(1):drop[sourceId:${source.data.id}]`),
  });

  userEvent.lift(draggableEl);
  expect(ordered).toEqual([
    'draggable(1):start[sourceId:1]',
    'a:start[sourceId:1]',
  ]);
  ordered.length = 0;

  // nothing changed!
  expect(ordered).toEqual([]);

  fireEvent.dragOver(A);
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual([
    'draggable(1):drag[sourceId:1]',
    'a:drag[sourceId:1]',
  ]);
  ordered.length = 0;

  // remove the old draggable
  cleanupDraggable1();

  // add draggable on same element with new events callbacks (and data)
  const cleanupDraggable2 = draggable({
    element: draggableEl,
    // changed data will not be picked up (only collected on pickup)
    getInitialData: () => ({ id: '2' }),
    onDragStart: ({ source }) =>
      ordered.push(`draggable(2):start[sourceId:${source.data.id}]`),
    onDrag: ({ source }) =>
      ordered.push(`draggable(2):drag[sourceId:${source.data.id}]`),
    onDrop: ({ source }) =>
      ordered.push(`draggable(2):drop[sourceId:${source.data.id}]`),
  });

  fireEvent.dragOver(A);
  // @ts-ignore
  requestAnimationFrame.step();

  // continued using the original `getData()` object
  expect(ordered).toEqual([
    'draggable(2):drag[sourceId:1]',
    'a:drag[sourceId:1]',
  ]);
  ordered.length = 0;

  fireEvent.drop(A);

  // continued using the original `getData()` object
  expect(ordered).toEqual([
    'draggable(2):drop[sourceId:1]',
    'a:drop[sourceId:1]',
  ]);

  cleanupDropTargets();
  cleanupDraggable2();
});

test('adding a drop target during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [Z] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanupA = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:update'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );

  userEvent.lift(draggableEl);
  expect(ordered).toEqual(['draggable:start', 'a:start']);
  ordered.length = 0;

  const cleanupZ = combine(
    appendToBody(Z),
    dropTargetForElements({
      element: Z,
      onDragStart: () => ordered.push('z:start'),
      onDropTargetChange: () => ordered.push('z:update'),
      onDragEnter: () => ordered.push('z:enter'),
      onDragLeave: () => ordered.push('z:leave'),
      onDrop: () => ordered.push('z:drop'),
    }),
  );

  // nothing changed!
  expect(ordered).toEqual([]);

  // [A] -> [Z]
  fireEvent.dragEnter(Z);
  expect(ordered).toEqual([
    'draggable:update',
    'a:update',
    'a:leave',
    'z:update',
    'z:enter',
  ]);
  ordered.length = 0;

  userEvent.drop(Z);

  expect(ordered).toEqual(['draggable:drop', 'z:drop']);

  cleanupA();
  cleanupZ();
});

test('removing a drop target during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [Z] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanupA = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:update'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );
  const cleanupZ = combine(
    appendToBody(Z),
    dropTargetForElements({
      element: Z,
      onDragStart: () => ordered.push('z:start'),
      onDropTargetChange: () => ordered.push('z:update'),
      onDragEnter: () => ordered.push('z:enter'),
      onDragLeave: () => ordered.push('z:leave'),
      onDrop: () => ordered.push('z:drop'),
    }),
  );

  userEvent.lift(draggableEl);
  expect(ordered).toEqual(['draggable:start', 'a:start']);
  ordered.length = 0;

  // [A] -> [Z]
  fireEvent.dragEnter(Z);
  expect(ordered).toEqual([
    'draggable:update',
    'a:update',
    'a:leave',
    'z:update',
    'z:enter',
  ]);
  ordered.length = 0;

  // Remove Z
  // [Z] -> []
  cleanupZ();

  fireEvent.dragOver(document.body);

  // Z no longer communicated with
  expect(ordered).toEqual(['draggable:update']);
  ordered.length = 0;

  userEvent.cancel(draggableEl);
  expect(ordered).toEqual(['draggable:drop']);

  cleanupA();
});

test('changing a drop target during a drag', () => {
  const [draggableEl, A] = getElements('div');
  const ordered: string[] = [];

  function getLabel({
    id,
    eventName,
    expectedData,
  }: {
    id: string;
    eventName: string;
    expectedData: Record<string, unknown>;
  }): string {
    return `id:[${id}] event:[${eventName}] data:[${JSON.stringify(
      expectedData,
    )}]`;
  }

  function add({ id, eventName }: { id: string; eventName: string }) {
    return function onEvent({
      location,
    }: ElementEventPayloadMap[keyof ElementEventPayloadMap]) {
      const targetId = location.current.dropTargets[0]?.data.id ?? 'NO-TARGET';
      ordered.push(getLabel({ id, eventName, expectedData: { id: targetId } }));
    };
  }
  const cleanupDraggable = combine(
    appendToBody(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrag: () => ordered.push('draggable:drag'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );
  const cleanupAElement = appendToBody(A);
  const cleanupA1 = dropTargetForElements({
    element: A,
    getData: () => ({ id: 'A1' }),
    onDragStart: add({ id: 'A1', eventName: 'start' }),
    onDropTargetChange: add({ id: 'A1', eventName: 'change' }),
    onDragEnter: add({ id: 'A1', eventName: 'enter' }),
    onDragLeave: add({ id: 'A1', eventName: 'leave' }),
    onDrop: add({ id: 'A1', eventName: 'drop' }),
  });

  userEvent.lift(draggableEl);
  expect(ordered).toEqual(['draggable:start']);
  ordered.length = 0;

  // [] -> [A]
  fireEvent.dragEnter(A);
  expect(ordered).toEqual([
    'draggable:change',
    getLabel({ id: 'A1', eventName: 'change', expectedData: { id: 'A1' } }),
    getLabel({ id: 'A1', eventName: 'enter', expectedData: { id: 'A1' } }),
  ]);
  ordered.length = 0;

  // Remounting A1
  cleanupA1();
  const cleanupA2 = dropTargetForElements({
    element: A,
    getData: () => ({ id: 'A2' }),
    onDragStart: add({ id: 'A2', eventName: 'start' }),
    onDropTargetChange: add({ id: 'A2', eventName: 'change' }),
    onDrag: add({ id: 'A2', eventName: 'drag' }),
    onDragEnter: add({ id: 'A2', eventName: 'enter' }),
    onDragLeave: add({ id: 'A2', eventName: 'leave' }),
    onDrop: add({ id: 'A2', eventName: 'drop' }),
  });

  // no change events
  expect(ordered).toEqual([]);

  fireEvent.dragOver(A);
  // @ts-ignore
  requestAnimationFrame.step();

  // now it is the remounted drop target that is having their data collected
  expect(ordered).toEqual([
    'draggable:drag',
    getLabel({ id: 'A2', eventName: 'drag', expectedData: { id: 'A2' } }),
  ]);
  ordered.length = 0;

  fireEvent.drop(A);
  expect(ordered).toEqual([
    'draggable:drop',
    getLabel({ id: 'A2', eventName: 'drop', expectedData: { id: 'A2' } }),
  ]);

  cleanupA2();
  cleanupAElement();
  cleanupDraggable();
});

test('removing home drop target during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  appendToBody(A);
  const cleanupA = dropTargetForElements({
    element: A,
    onDragStart: () => ordered.push('a:start'),
    onDropTargetChange: () => ordered.push('a:update'),
    onDragEnter: () => ordered.push('a:enter'),
    onDragLeave: () => ordered.push('a:leave'),
    onDrop: () => ordered.push('a:drop'),
  });
  const cleanupDraggable = combine(
    () => draggableEl.parentElement?.removeChild(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:update'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // initial lift
  userEvent.lift(draggableEl);
  expect(ordered).toEqual(['draggable:start', 'a:start']);
  ordered.length = 0;

  // Removing parent `A` while keeping `draggableEl`

  const parent = A.parentElement;
  parent?.removeChild(A);
  parent?.appendChild(draggableEl);
  cleanupA();

  // now we are going to drag over draggableEl
  fireEvent.dragOver(draggableEl);

  expect(ordered).toEqual(['draggable:update']);
  ordered.length = 0;

  userEvent.cancel(draggableEl);
  expect(ordered).toEqual(['draggable:drop']);

  cleanupA();
  cleanupDraggable();
});
