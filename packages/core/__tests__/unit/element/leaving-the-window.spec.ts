import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
} from '../../../src/entry-point/element/adapter';
import { appendToBody, getBubbleOrderedTree, reset, userEvent } from '../_util';

afterEach(reset);

[true, false].forEach(isSticky => {
  it(`should clear drop targets when leaving the window (Sticky: ${isSticky})`, () => {
    const [draggableEl, A] = getBubbleOrderedTree();
    A.id = 'A';
    const ordered: string[] = [];

    const cleanup = combine(
      appendToBody(A),
      draggable({
        element: draggableEl,
        onDragStart: () => ordered.push('draggable:start'),
        onDropTargetChange: () => ordered.push('draggable:update'),
      }),
      dropTargetForElements({
        element: A,
        getIsSticky: () => isSticky,
        onDragStart: () => ordered.push('a:start'),
        onDropTargetChange: () => ordered.push('a:update'),
        onDragLeave: () => ordered.push('a:leave'),
        onDragEnter: () => ordered.push('a:enter'),
      }),
    );

    userEvent.lift(draggableEl);
    expect(ordered).toEqual(['draggable:start', 'a:start']);
    ordered.length = 0;

    fireEvent.dragLeave(document.body, { relatedTarget: null });

    expect(ordered).toEqual(['draggable:update', 'a:update', 'a:leave']);

    cleanup();
  });
});
