import { bind } from 'bind-event-listener';

import { combine } from '../../../../src/entry-point/combine';
import { monitorForTextSelection } from '../../../../src/entry-point/text-selection/adapter';
import { appendToBody, getElements, nativeDrag, reset } from '../../_util';

afterEach(reset);

it('should not start a drag if "dragstart" is cancelled', () => {
  const [paragraph] = getElements('p');
  paragraph.textContent = 'Text to be dragged';
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(paragraph),
    monitorForTextSelection({
      onDragStart: () => ordered.push('monitor:preview'),
    }),
    bind(window, {
      type: 'dragstart',
      listener: event => {
        ordered.push('cancelled');
        event.preventDefault();
      },
      // hit before our native adapter
      options: { capture: true },
    }),
  );

  nativeDrag.startTextSelectionDrag({
    element: paragraph,
  });

  expect(ordered).toEqual(['cancelled']);

  cleanup();
});
