import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset } from '../../_util';

afterEach(reset);

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
    test('scenario: [] -> [] should not update', () => {
      const [draggableEl, A, B] = getElements('div');
      A.appendChild(B);
      const started: string[] = [];
      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(A, draggableEl),
        draggable({
          element: draggableEl,
          onDragStart: () => started.push('draggable:start'),
          onDropTargetChange: () => ordered.push('draggable:update'),
        }),
        monitorForElements({
          onDragStart: () => started.push('monitor:start'),
          onDropTargetChange: () => ordered.push('monitor:update'),
        }),
        dropTargetForElements({
          element: A,
          onDragStart: () => started.push('a:start'),
          onDropTargetChange: () => ordered.push('a:update'),
          onDragEnter: () => ordered.push('a:enter'),
          onDragLeave: () => ordered.push('a:leave'),
        }),
        dropTargetForElements({
          element: B,
          onDragStart: () => started.push('b:start'),
          onDropTargetChange: () => ordered.push('b:update'),
          onDragEnter: () => ordered.push('b:enter'),
          onDragLeave: () => ordered.push('b:leave'),
        }),
      );

      fireEvent.dragStart(draggableEl);
      // @ts-ignore
      requestAnimationFrame.step();

      // draggable does not start inside any drop target
      expect(started).toEqual(['draggable:start', 'monitor:start']);

      // not going over anything
      trigger.fire(document.body);
      expect(ordered).toEqual([]);

      // nothing has changed, so no update should be fired
      trigger.fire(document.body);
      expect(ordered).toEqual([]);

      cleanup();
    });

    test('scenario: [B, A] -> [B, A] should not update', () => {
      const [draggableEl, A, B] = getElements('div');
      A.appendChild(B);
      const started: string[] = [];
      const ordered: string[] = [];

      const cleanup = combine(
        appendToBody(A, draggableEl),
        draggable({
          element: draggableEl,
          onDragStart: () => started.push('draggable:start'),
          onDropTargetChange: () => ordered.push('draggable:update'),
        }),
        monitorForElements({
          onDragStart: () => started.push('monitor:start'),
          onDropTargetChange: () => ordered.push('monitor:update'),
        }),
        dropTargetForElements({
          element: A,
          onDragStart: () => started.push('a:start'),
          onDropTargetChange: () => ordered.push('a:update'),
          onDragEnter: () => ordered.push('a:enter'),
          onDragLeave: () => ordered.push('a:leave'),
        }),
        dropTargetForElements({
          element: B,
          onDragStart: () => started.push('b:start'),
          onDropTargetChange: () => ordered.push('b:update'),
          onDragEnter: () => ordered.push('b:enter'),
          onDragLeave: () => ordered.push('b:leave'),
        }),
      );

      fireEvent.dragStart(draggableEl);
      // @ts-ignore
      requestAnimationFrame.step();

      // draggable does not start inside any drop target
      expect(started).toEqual(['draggable:start', 'monitor:start']);

      trigger.fire(B);
      expect(ordered).toEqual([
        'draggable:update',
        'b:update',
        'b:enter',
        'a:update',
        'a:enter',
        'monitor:update',
      ]);
      // resetting
      ordered.length = 0;

      trigger.fire(B);

      // nothing has changed, so no update should be fired
      expect(ordered).toEqual([]);

      cleanup();
    });
  });
});
