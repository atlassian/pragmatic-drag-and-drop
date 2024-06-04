import { createEvent, fireEvent } from '@testing-library/dom';
import { bind, bindAll } from 'bind-event-listener';

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

test('an unmanaged "drop" event should not be cancelled', () => {
  const [paragraph] = getElements('p');
  paragraph.textContent = 'Text to be dragged';
  const ordered: string[] = [];
  const [unmanagedDropTarget] = getElements('div');

  const cleanup = combine(
    appendToBody(paragraph, unmanagedDropTarget),
    monitorForTextSelection({
      onDragStart: () => ordered.push('monitor:start'),
      onDrop: () => ordered.push('monitor:drop'),
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

  nativeDrag.startTextSelectionDrag({
    element: paragraph,
  });

  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  fireEvent.dragEnter(unmanagedDropTarget);

  expect(ordered).toEqual(['unmanaged:enter']);
  ordered.length = 0;

  const event = createEvent.drop(unmanagedDropTarget);
  fireEvent.drop(unmanagedDropTarget, event);

  // "drop" event not cancelled
  expect(event.defaultPrevented).toBe(false);
  expect(ordered).toEqual(['monitor:drop', 'unmanaged:drop']);

  cleanup();
});
