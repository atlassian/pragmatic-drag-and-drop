import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  dropTargetForExternal,
  monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import {
  appendToBody,
  getElements,
  nativeDrag,
  reset,
  setElementFromPoint,
  userEvent,
} from '../../_util';

afterEach(reset);

/** Ideally we would be validating the bug still exists, and that our fix works, through browser tests.
 * However, I could not get puppeteer to replicate the browser bug, so some basic unit tests is
 * all we can do at this stage 😢
 */

function findStyleElement(): HTMLStyleElement | null {
  return document.querySelector('head style[pdnd-post-drag-fix]');
}

it('should not apply the fix for external native drags', async () => {
  const [dropTarget] = getElements('div');

  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      dropTargetForExternal({
        element: dropTarget,
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
      monitorForExternal({
        onDragStart: () => ordered.push('monitor:start'),
        onDrop: () => ordered.push('monitor:drop'),
      }),
    ),
  );

  nativeDrag.startExternal({
    items: [{ data: 'Hello', type: 'text/plain' }],
  });

  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);

  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['dropTarget:drop', 'monitor:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // fix never applied
  expect(findStyleElement()).toBe(null);

  cleanups.forEach(cleanup => cleanup());
});
