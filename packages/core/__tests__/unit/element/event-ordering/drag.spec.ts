import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  type ElementEventPayloadMap,
  monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { type DropTargetRecord, type Input } from '../../../../src/entry-point/types';
import {
  appendToBody,
  getBubbleOrderedTree,
  getDefaultInput,
  getElements,
  reset,
  userEvent,
} from '../../_util';

afterEach(reset);

test('fire drag events', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrag: () => ordered.push('draggable:drag'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDropTargetChange: () => ordered.push('monitor:change'),
      onDrag: () => ordered.push('monitor:drag'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrag: () => ordered.push('a:drag'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDropTargetChange: () => ordered.push('b:change'),
      onDragEnter: () => ordered.push('b:enter'),
      onDragLeave: () => ordered.push('b:leave'),
      onDrag: () => ordered.push('b:drag'),
    }),
  );

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

  // no change in target
  fireEvent.dragOver(B);

  // not called until next animation frame
  expect(ordered).toEqual([]);

  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual([
    'draggable:drag',
    'b:drag',
    'a:drag',
    'monitor:drag',
  ]);

  cleanup();
});

test('drag events should be throttled', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const onDrag = jest.fn(() => ordered.push('draggable:drag'));
  const initialInput: Input = getDefaultInput();

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrag: onDrag,
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDropTargetChange: () => ordered.push('monitor:change'),
      onDrag: () => ordered.push('monitor:drag'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrag: () => ordered.push('a:drag'),
    }),
    dropTargetForElements({
      element: B,
      onDragStart: () => ordered.push('b:start'),
      onDropTargetChange: () => ordered.push('b:change'),
      onDragEnter: () => ordered.push('b:enter'),
      onDragLeave: () => ordered.push('b:leave'),
      onDrag: () => ordered.push('b:drag'),
    }),
  );

  fireEvent.dragStart(draggableEl, initialInput);
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual([
    'draggable:start',
    'b:start',
    'a:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  const first = getDefaultInput({ pageX: 1 });
  const second = getDefaultInput({ pageX: 2 });
  const third = getDefaultInput({ pageX: 3 });

  fireEvent.dragOver(B, first);
  fireEvent.dragOver(B, second);
  fireEvent.dragOver(B, third);

  // not called until next animation frame
  expect(ordered).toEqual([]);

  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual([
    'draggable:drag',
    'b:drag',
    'a:drag',
    'monitor:drag',
  ]);
  ordered.length = 0;

  expect(onDrag).toHaveBeenCalledTimes(1);

  const initialDropTargets: DropTargetRecord[] = [
    {
      element: B,
      data: {},
      dropEffect: 'move',
      isActiveDueToStickiness: false,
    },
    {
      element: A,
      data: {},
      dropEffect: 'move',
      isActiveDueToStickiness: false,
    },
  ];
  const expected: ElementEventPayloadMap['onDrag'] = {
    location: {
      initial: {
        dropTargets: initialDropTargets,
        input: initialInput,
      },
      previous: {
        dropTargets: initialDropTargets,
      },
      current: {
        dropTargets: initialDropTargets,
        // called with the latest input
        input: third,
      },
    },
    source: {
      element: draggableEl,
      dragHandle: null,
      data: {},
    },
  };
  expect(onDrag).toHaveBeenCalledWith(expected);

  // @ts-ignore
  requestAnimationFrame.flush();

  expect(ordered).toEqual([]);

  cleanup();
});

test('a throttled drag event should be canceled by a drop target change', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [X] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    appendToBody(X),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrag: () => ordered.push('draggable:drag'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDropTargetChange: () => ordered.push('monitor:change'),
      onDrag: () => ordered.push('monitor:drag'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrag: () => ordered.push('a:drag'),
    }),
    dropTargetForElements({
      element: X,
      onDragStart: () => ordered.push('x:start'),
      onDropTargetChange: () => ordered.push('x:change'),
      onDragEnter: () => ordered.push('x:enter'),
      onDragLeave: () => ordered.push('x:leave'),
      onDrag: () => ordered.push('x:drag'),
    }),
  );

  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  // Dragging item, drag event throttled
  fireEvent.dragOver(A);
  // not called until next animation frame
  expect(ordered).toEqual([]);

  // Changing drop targets [A] -> [X]
  fireEvent.dragEnter(X);

  expect(ordered).toEqual([
    'draggable:change',
    'a:change',
    'a:leave',
    'x:change',
    'x:enter',
    'monitor:change',
  ]);
  ordered.length = 0;

  // would usually flush the drag event
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual([]);

  // just checking that drag is still not pending
  // @ts-ignore
  requestAnimationFrame.flush();
  expect(ordered).toEqual([]);

  cleanup();
});

test('a throttled drag event should be canceled by a drop', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrag: () => ordered.push('draggable:drag'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDropTargetChange: () => ordered.push('monitor:change'),
      onDrag: () => ordered.push('monitor:drag'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrag: () => ordered.push('a:drag'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );

  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  fireEvent.dragOver(A);
  // not called until next animation frame
  expect(ordered).toEqual([]);

  // drop
  fireEvent.drop(A);
  expect(ordered).toEqual(['draggable:drop', 'a:drop', 'monitor:drop']);
  ordered.length = 0;

  // checking that drag is still not pending
  // @ts-ignore
  requestAnimationFrame.flush();
  expect(ordered).toEqual([]);

  cleanup();
});

test('a throttled drag event should be canceled by a cancel', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrag: () => ordered.push('draggable:drag'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
      onDropTargetChange: () => ordered.push('monitor:change'),
      onDrag: () => ordered.push('monitor:drag'),
      onDrop: () => ordered.push('monitor:drop'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('a:start'),
      onDropTargetChange: () => ordered.push('a:change'),
      onDragEnter: () => ordered.push('a:enter'),
      onDragLeave: () => ordered.push('a:leave'),
      onDrag: () => ordered.push('a:drag'),
      onDrop: () => ordered.push('a:drop'),
    }),
  );

  fireEvent.dragStart(draggableEl);
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
  ordered.length = 0;

  fireEvent.dragOver(A);
  // not called until next animation frame
  expect(ordered).toEqual([]);

  userEvent.cancel();
  expect(ordered).toEqual([
    // a is left
    'draggable:change',
    'a:change',
    'a:leave',
    'monitor:change',
    // drop
    'draggable:drop',
    'monitor:drop',
  ]);
  ordered.length = 0;

  // checking that drag is still not pending
  // @ts-ignore
  requestAnimationFrame.flush();
  expect(ordered).toEqual([]);

  cleanup();
});
