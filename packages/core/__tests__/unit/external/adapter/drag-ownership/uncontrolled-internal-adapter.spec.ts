import { combine } from '../../../../../src/entry-point/combine';
import { draggable } from '../../../../../src/entry-point/element/adapter';
import { monitorForExternal } from '../../../../../src/entry-point/external/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  nativeDrag,
  reset,
} from '../../../_util';

afterEach(reset);

test('uncontrolled internal native drags should not trigger the external adapter', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [link] = getElements('a');
  link.href = '#hello';
  const ordered: string[] = [];

  A.appendChild(link);
  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
    }),
    monitorForExternal({
      onDragStart: () => ordered.push('monitor(external):start'),
    }),
  );

  nativeDrag.startInternal({
    target: link,
    items: [{ data: 'Plain text', type: 'text/plain' }],
  });

  expect(ordered).toEqual([]);

  cleanup();
});
