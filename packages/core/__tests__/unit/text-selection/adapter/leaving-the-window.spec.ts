import { combine } from '../../../../src/entry-point/combine';
import { monitorForTextSelection } from '../../../../src/entry-point/text-selection/adapter';
import {
  appendToBody,
  getElements,
  nativeDrag,
  reset,
  userEvent,
} from '../../_util';

afterEach(reset);

it('should not end an text selection drag when dragging out of the window', () => {
  const [paragraph] = getElements('p');
  paragraph.textContent = 'Hello world';
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(paragraph),
    monitorForTextSelection({
      onDragStart() {
        ordered.push('monitor:start');
      },
      onDrop() {
        ordered.push('monitor:drop');
      },
    }),
  );

  // First enter event is into A
  nativeDrag.startTextSelectionDrag({
    element: paragraph,
  });

  expect(ordered).toEqual(['monitor:start']);
  ordered.length = 0;

  // leaving the window does not end the drag
  userEvent.leaveWindow();

  expect(ordered).toEqual([]);

  // finishing the drag with an explicit cancel
  userEvent.cancel();
  expect(ordered).toEqual(['monitor:drop']);

  cleanup();
});
