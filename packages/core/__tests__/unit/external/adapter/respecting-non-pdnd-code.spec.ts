import { bind } from 'bind-event-listener';

import { combine } from '../../../../src/entry-point/combine';
import { monitorForExternal } from '../../../../src/entry-point/external/adapter';
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
      onDragStart: () => ordered.push('monitor:preview'),
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

  expect(ordered).toEqual(['cancelled', 'monitor:preview']);

  cleanup();
});
