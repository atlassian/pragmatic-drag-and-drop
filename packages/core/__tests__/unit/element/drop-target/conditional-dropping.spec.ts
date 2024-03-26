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
  userEvent,
} from '../../_util';

afterEach(reset);

test('scenario: [A(blocked)] = [] (blocked drop targets are ignored when lifting)', () => {
  const [draggableEl, A] = getBubbleOrderedTree();

  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    monitorForElements({
      onDragStart: () => ordered.push('monitor:start'),
    }),
    dropTargetForElements({
      element: A,
      canDrop: () => false,
      onDragStart: () => ordered.push('a:start'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['draggable:start', 'monitor:start']);

  cleanup();
});

const triggers = [
  {
    name: 'dragenter',
    fire: (element: Element) => fireEvent.dragEnter(element),
  },
  {
    name: 'dragover',
    fire: (element: Element) => fireEvent.dragOver(element),
  },
];

triggers.forEach(trigger => {
  describe(`update trigger: ${trigger.name}`, () => {
    test('scenario: [] -> [A(blocked)] = [] (blocked drop targets are ignored when entering)', () => {
      const [draggableEl, A] = getElements('div');

      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(A, draggableEl),
        monitorForElements({
          onDragStart: () => ordered.push('monitor:start'),
          onDropTargetChange: () => ordered.push('monitor:update'),
        }),
        dropTargetForElements({
          element: A,
          canDrop: () => false,
          onDragStart: () => ordered.push('a:start'),
          onDragEnter: () => ordered.push('a:enter'),
          onDragLeave: () => ordered.push('a:leave'),
          onDropTargetChange: () => ordered.push('a:update'),
        }),
        draggable({
          element: draggableEl,
          onDragStart: () => ordered.push('draggable:start'),
          onDropTargetChange: () => ordered.push('draggable:update'),
        }),
      );

      userEvent.lift(draggableEl);

      expect(ordered).toEqual(['draggable:start', 'monitor:start']);
      ordered.length = 0;

      trigger.fire(draggableEl);

      expect(ordered).toEqual([]);

      cleanup();
    });

    test('scenario: [A] -> [A(blocked)] = [] (drop targets can change their mind about being blocked)', () => {
      const [draggableEl, A] = getBubbleOrderedTree();

      const ordered: string[] = [];

      let allowDropInA: boolean = true;

      const cleanup = combine(
        appendToBody(A),
        monitorForElements({
          onDragStart: () => ordered.push('monitor:start'),
          onDropTargetChange: () => ordered.push('monitor:update'),
        }),
        dropTargetForElements({
          element: A,
          canDrop: () => allowDropInA,
          onDragStart: () => ordered.push('a:start'),
          onDragEnter: () => ordered.push('a:enter'),
          onDragLeave: () => ordered.push('a:leave'),
          onDropTargetChange: () => ordered.push('a:update'),
        }),
        draggable({
          element: draggableEl,
          onDragStart: () => ordered.push('draggable:start'),
          onDropTargetChange: () => ordered.push('draggable:update'),
        }),
      );

      userEvent.lift(draggableEl);

      expect(ordered).toEqual(['draggable:start', 'a:start', 'monitor:start']);
      ordered.length = 0;

      // now disabling A
      allowDropInA = false;

      trigger.fire(draggableEl);

      expect(ordered).toEqual([
        'draggable:update',
        'a:update',
        // leaving A
        'a:leave',
        'monitor:update',
      ]);

      cleanup();
    });

    test('scenario: [] -> [C, B(blocked), A] = [C, A] (blocking continues upward search)', () => {
      const [draggableEl, A, B, C] = getElements('div');
      A.appendChild(B);
      B.appendChild(C);

      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(draggableEl, A),
        dropTargetForElements({
          element: A,
          // I will allow a drop (but it won't matter because B will block it)
          canDrop: () => true,
          onDropTargetChange: () => ordered.push('a:update'),
          onDragEnter: () => ordered.push('a:enter'),
          onDragLeave: () => ordered.push('a:leave'),
        }),
        dropTargetForElements({
          element: B,
          // I am not going to allow a drop
          canDrop: () => false,
          onDropTargetChange: () => ordered.push('b:update'),
          onDragEnter: () => ordered.push('b:enter'),
          onDragLeave: () => ordered.push('b:leave'),
        }),
        dropTargetForElements({
          element: C,
          canDrop: () => true,
          onDropTargetChange: () => ordered.push('c:update'),
          onDragEnter: () => ordered.push('c:enter'),
          onDragLeave: () => ordered.push('c:leave'),
        }),
        draggable({
          element: draggableEl,
          onDropTargetChange: () => ordered.push('draggable:update'),
        }),
      );

      fireEvent.dragStart(draggableEl);

      // @ts-ignore
      requestAnimationFrame.step();

      fireEvent.dragEnter(C);

      expect(ordered).toEqual([
        'draggable:update',
        'c:update',
        'c:enter',
        'a:update',
        'a:enter',
      ]);

      cleanup();
    });

    test('scenario: [] -> [C, B(blocked), A] = [C, A] (blocked drop targets should not have data/dropEffect requested)', () => {
      const [draggableEl, A, B, C] = getElements('div');
      A.appendChild(B);
      B.appendChild(C);
      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(draggableEl, A),
        dropTargetForElements({
          element: A,
          // I will allow a drop (but it won't matter because B will block it)
          canDrop: () => true,
          getData: () => {
            ordered.push('a:data');
            return {};
          },
          getDropEffect: () => {
            ordered.push('a:dropEffect');
            return 'move';
          },
        }),
        dropTargetForElements({
          element: B,
          // I am not going to allow a drop
          canDrop: () => false,
          getData: () => {
            ordered.push('b:data');
            return {};
          },
          getDropEffect: () => {
            ordered.push('b:dropEffect');
            return 'move';
          },
        }),
        dropTargetForElements({
          element: C,
          // canDrop: () => true is the default
          getData: () => {
            ordered.push('c:data');
            return {};
          },
          getDropEffect: () => {
            ordered.push('c:dropEffect');
            return 'move';
          },
        }),
        draggable({
          element: draggableEl,
        }),
      );

      fireEvent.dragStart(draggableEl);
      // @ts-ignore
      requestAnimationFrame.step();
      expect(ordered).toEqual([]);

      fireEvent.dragEnter(C);

      expect(ordered).toEqual([
        'c:data',
        'c:dropEffect',
        'a:data',
        'a:dropEffect',
      ]);

      cleanup();
    });
  });
});
