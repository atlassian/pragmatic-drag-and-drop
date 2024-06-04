import { fireEvent } from '@testing-library/dom';
import { bind, bindAll } from 'bind-event-listener';

import { combine } from '../../../../src/entry-point/combine';
import { monitorForExternal } from '../../../../src/entry-point/external/adapter';
import { getText } from '../../../../src/entry-point/external/text';
import {
  appendToBody,
  getBubbleOrderedTree,
  nativeDrag,
  reset,
} from '../../_util';

afterEach(reset);

it('should allow an external drag to start even if "dragenter" is cancelled', () => {
  const [child, parent] = getBubbleOrderedTree();
  child.textContent = 'Text to be dragged';
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(parent),
    monitorForExternal({
      onDragStart: () => ordered.push('monitor:start'),
    }),
    bind(window, {
      type: 'dragenter',
      listener: event => {
        ordered.push('cancelled');
        event.preventDefault();
      },
      // hit before our external adapter
      options: { capture: true },
    }),
  );

  nativeDrag.startExternal({
    items: [{ data: 'hello', type: 'text/plain' }],
  });

  expect(ordered).toEqual(['cancelled', 'monitor:start']);

  cleanup();
});

test('an unmanaged "drop" event should not be cancelled', () => {
  const [unmanagedDropTarget] = getBubbleOrderedTree();

  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(unmanagedDropTarget),
    monitorForExternal({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: ({ source }) =>
        // no access to source.items as we did not drop on a drop target
        ordered.push(`monitor:drop - text:${getText({ source }) ?? '(none)'}`),
    }),
    bindAll(unmanagedDropTarget, [
      {
        type: 'dragover',
        listener: event => {
          ordered.push('unmanaged:over');
          event.preventDefault();
        },
      },
      {
        type: 'dragenter',
        listener: event => {
          event.preventDefault();
          ordered.push('unmanaged:enter');
        },
      },
      {
        type: 'drop',
        listener: () => {
          ordered.push('unmanaged:drop');
        },
      },
    ]),
  );

  nativeDrag.startExternal({
    items: [{ data: 'hello', type: 'text/plain' }],
  });

  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  fireEvent.dragEnter(unmanagedDropTarget);

  expect(ordered).toEqual(['unmanaged:enter']);
  ordered.length = 0;

  const event = nativeDrag.drop({
    items: [{ data: 'hello', type: 'text/plain' }],
    target: unmanagedDropTarget,
  });

  expect(event.defaultPrevented).toBe(false);
  expect(ordered).toEqual(['monitor:drop - text:(none)', 'unmanaged:drop']);

  cleanup();
});
