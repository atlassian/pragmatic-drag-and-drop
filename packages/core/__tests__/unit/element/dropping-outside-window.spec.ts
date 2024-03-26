import { combine } from '../../../src/entry-point/combine';
import { draggable } from '../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset, userEvent } from '../_util';

afterEach(reset);

it('should cancel the drag', () => {
  const [draggableEl] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('start'),
      onDrop: () => ordered.push('drop'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  userEvent.leaveWindow();

  // no changes yet
  expect(ordered).toEqual([]);

  userEvent.cancel(draggableEl);

  expect(ordered).toEqual(['drop']);

  cleanup();
});

it('should cancel a drag if a "pointermove" occurs (should not happen during a drag)', () => {
  const [draggableEl] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('start'),
      onDrop: () => ordered.push('drop'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  userEvent.leaveWindow();

  // no changes yet
  expect(ordered).toEqual([]);

  // pointer events
  userEvent.rougePointerMoves();
  expect(ordered).toEqual(['drop']);

  cleanup();
});
