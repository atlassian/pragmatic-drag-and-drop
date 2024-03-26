import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  reset,
} from '../../_util';

afterEach(reset);

test('scenario: [] -> drop', () => {
  const [draggableEl] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(draggableEl),
    monitorForElements({
      onDrop: () => ordered.push('monitor:drop'),
    }),
    draggable({
      element: draggableEl,
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([]);

  // drop
  fireEvent.drop(document.body);
  expect(ordered).toEqual(['draggable:drop', 'monitor:drop']);

  cleanup();
});

test('scenario: [] -> cancel', () => {
  const [draggableEl] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(draggableEl),
    monitorForElements({
      onDrop: () => ordered.push('monitor:drop'),
    }),
    draggable({
      element: draggableEl,
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([]);

  // drop
  fireEvent.dragEnd(document.body);
  expect(ordered).toEqual(['draggable:drop', 'monitor:drop']);

  cleanup();
});

test('scenario: [A] -> [] -> drop', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  // [A] -> []
  fireEvent.dragEnter(document.body);

  // drop
  fireEvent.drop(document.body);
  expect(ordered).toEqual(['draggable:drop', 'monitor:drop']);

  cleanup();
});

test('scenario: [A] -> [] -> cancel', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const start: string[] = [];
  const drop: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => start.push('monitor:start'),
      onDrop: () => drop.push('monitor:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => start.push('a:start'),
      onDrop: () => drop.push('a:drop'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => start.push('draggable:start'),
      onDrop: () => drop.push('draggable:drop'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(drop).toEqual([]);
  expect(start).toEqual(['draggable:start', 'a:start', 'monitor:start']);

  // [A] -> []
  fireEvent.dragEnter(document.body);

  // cancel
  fireEvent.dragEnd(document.body);
  expect(drop).toEqual(['draggable:drop', 'monitor:drop']);

  cleanup();
});

test('scenario: [B, A] -> drop', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDrop: () => ordered.push('b:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:start',
    'b:start',
    'a:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // drop
  fireEvent.drop(B);
  expect(ordered).toEqual([
    'draggable:drop',
    'b:drop',
    'a:drop',
    'monitor:drop',
  ]);

  cleanup();
});

test('scenario: [B, A] -> cancel', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
      onDropTargetChange: () => ordered.push('monitor:update'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDrop: () => ordered.push('b:drop'),
      onDropTargetChange: () => ordered.push('b:update'),
      onDragEnter: () => ordered.push('b:enter'),
      onDragLeave: () => ordered.push('b:leave'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
      onDropTargetChange: () => ordered.push('draggable:update'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:start',
    'b:start',
    'a:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // canceling an event while over drop targets
  // will add an extra event to 'leave' the current drop targets
  fireEvent.dragEnd(B);
  expect(ordered).toEqual([
    'draggable:update',
    'b:update',
    'b:leave',
    'a:update',
    'a:leave',
    'monitor:update',
    // drop event fired
    'draggable:drop',
    'monitor:drop',
  ]);

  cleanup();
});

test('scenario: [B, A] -> cancel (dragleave + dragend)', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
      onDropTargetChange: () => ordered.push('monitor:update'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDrop: () => ordered.push('b:drop'),
      onDropTargetChange: () => ordered.push('b:update'),
      onDragEnter: () => ordered.push('b:enter'),
      onDragLeave: () => ordered.push('b:leave'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
      onDropTargetChange: () => ordered.push('draggable:update'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:start',
    'b:start',
    'a:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // canceling an event while over drop targets
  // this will cause the browser to do a "dragleave" with `relatedTarget` set to null
  fireEvent.dragLeave(B, { relatedTarget: null });

  expect(ordered).toEqual([
    'draggable:update',
    'b:update',
    'b:leave',
    'a:update',
    'a:leave',
    'monitor:update',
  ]);
  ordered.length = 0;

  fireEvent.dragEnd(B);
  expect(ordered).toEqual(['draggable:drop', 'monitor:drop']);

  cleanup();
});

// this test is just checking that just a "dragend" behaves in the same way as "dragleave" + "dragend"
// this is nice to validate as often tests will just to a "dragend"
test('scenario: [B, A] -> cancel (dragend only)', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
      onDropTargetChange: () => ordered.push('monitor:update'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDrop: () => ordered.push('b:drop'),
      onDropTargetChange: () => ordered.push('b:update'),
      onDragEnter: () => ordered.push('b:enter'),
      onDragLeave: () => ordered.push('b:leave'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDrop: () => ordered.push('a:drop'),
      onDropTargetChange: () => ordered.push('a:update'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
      onDropTargetChange: () => ordered.push('draggable:update'),
    }),
  );

  // lift
  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:start',
    'b:start',
    'a:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // note: no 'dragleave' being fired
  fireEvent.dragEnd(B);

  expect(ordered).toEqual([
    'draggable:update',
    'b:update',
    'b:leave',
    'a:update',
    'a:leave',
    'monitor:update',
    // we get another update for the drop event
    'draggable:drop',
    'monitor:drop',
  ]);

  cleanup();
});
