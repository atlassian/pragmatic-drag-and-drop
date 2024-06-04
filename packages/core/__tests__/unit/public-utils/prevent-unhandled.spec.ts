import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
} from '../../../src/entry-point/element/adapter';
import { preventUnhandled } from '../../../src/entry-point/prevent-unhandled';
import { appendToBody, getElements, reset, userEvent } from '../_util';

afterEach(reset);

const options = { cancelable: true, bubbles: true };

// like our userEvent.cancel function, except returns the dragEnd event
function cancel(target: Element): DragEvent {
  target.dispatchEvent(new DragEvent('dragleave', options));
  const dragEnd = new DragEvent('dragend', options);
  target.dispatchEvent(dragEnd);
  return dragEnd;
}

function drop(target: Element): DragEvent {
  const event = new DragEvent('drop', options);
  target.dispatchEvent(event);
  return event;
}

it('should work with explicit cancels', () => {
  const [draggableEl] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(draggableEl),
    draggable({
      element: draggableEl,
      onDragStart() {
        ordered.push('start');
        preventUnhandled.start();
      },
      onDrop() {
        ordered.push('drop');
      },
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  const dragEnd = cancel(draggableEl);

  expect(ordered).toEqual(['drop']);
  // not interfering with the standard cancel drop effect
  expect(dragEnd.dataTransfer?.dropEffect).toEqual('none');

  cleanup();
});

it('should accept drops, even when over no drop targets', () => {
  const [draggableEl, sibling] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(draggableEl, sibling),
    draggable({
      element: draggableEl,
      onDragStart() {
        ordered.push('start');
        preventUnhandled.start();
      },
      onDrop() {
        ordered.push('drop');
      },
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // cancelling "dragenter" and "dragover" result in a drop being accepted.
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }

  const event = drop(draggableEl);

  expect(ordered).toEqual(['drop']);
  expect(event.dataTransfer?.dropEffect).toEqual('none');
  // opting out of the browsers default "drop" behaviour
  expect(event.defaultPrevented).toBe(true);

  cleanup();
});

it('should not override the drop effect of a drop target', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: A,
      onDragStart() {
        ordered.push('draggable:start');
        preventUnhandled.start();
      },
      onDrop() {
        ordered.push('draggable:drop');
      },
    }),
    dropTargetForElements({
      element: A,
      getDropEffect: () => 'link',
      onDragStart: () => ordered.push('dropTarget:start'),
      onDrop: () => ordered.push('dropTarget:drop'),
    }),
  );

  userEvent.lift(A);
  expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
  ordered.length = 0;

  const event = drop(A);
  expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);

  // not being set to "none" or "move"
  expect(event.dataTransfer?.dropEffect).toEqual('link');

  cleanup();
});

it('should only apply to a single drag operation', () => {
  const [draggableEl, sibling] = getElements('div');
  const ordered: string[] = [];
  let isEnabled: boolean = true;

  const cleanup = combine(
    appendToBody(draggableEl, sibling),
    draggable({
      element: draggableEl,
      onDragStart() {
        ordered.push('start');
        if (isEnabled) {
          preventUnhandled.start();
        }
      },
      onDrop() {
        ordered.push('drop');
      },
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // cancelling "dragenter" and "dragover" result in a drop being accepted.
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }

  {
    const event = drop(draggableEl);
    expect(ordered).toEqual(['drop']);
    expect(event.dataTransfer?.dropEffect).toEqual('none');

    ordered.length = 0;
  }

  // doing another drag
  isEnabled = false;

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // "dragenter" and "dragover" no longer cancelled
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }

  // a "drop" event won't fire
  {
    const event = new DragEvent('dragend', options);
    draggableEl.dispatchEvent(event);

    expect(ordered).toEqual(['drop']);
    expect(event.dataTransfer?.dropEffect).toEqual('none');
  }

  cleanup();
});

it('should be able to be disabled and enabled during a drag', () => {
  const [draggableEl, siblingA, siblingB] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(draggableEl, siblingA, siblingB),
    draggable({
      element: draggableEl,
      onDragStart() {
        ordered.push('start');
        preventUnhandled.start();
      },
      onDrop() {
        ordered.push('drop');
      },
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // cancelling "dragenter" and "dragover" result in a drop being accepted.
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    siblingA.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    siblingA.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }

  preventUnhandled.stop();

  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    siblingB.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    siblingB.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }

  preventUnhandled.start();

  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    siblingA.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    siblingA.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }

  {
    const event = new DragEvent('dragend', options);
    draggableEl.dispatchEvent(event);

    expect(ordered).toEqual(['drop']);
    expect(event.dataTransfer?.dropEffect).toEqual('none');
  }

  cleanup();
});

it('should stop not block a future drag operation if a drag operation was aborted', () => {
  const [draggableEl, sibling] = getElements('div');
  const ordered: string[] = [];
  let isEnabled: boolean = true;

  const cleanup = combine(
    appendToBody(draggableEl, sibling),
    draggable({
      element: draggableEl,
      onDragStart() {
        ordered.push('start');
        if (isEnabled) {
          preventUnhandled.start();
        }
      },
      onDrop() {
        ordered.push('drop');
      },
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // cancelling "dragenter" and "dragover" result in a drop being accepted.
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(event.dataTransfer?.dropEffect).toBe('move');
  }

  // breaking a drag operation
  userEvent.rougePointerMoves();

  expect(ordered).toEqual(['drop']);
  ordered.length = 0;
  // doing another drag
  isEnabled = false;

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['start']);
  ordered.length = 0;

  // "dragenter" and "dragover" no longer cancelled
  {
    const event = new DragEvent('dragenter', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }
  {
    const event = new DragEvent('dragover', {
      cancelable: true,
      bubbles: true,
    });
    sibling.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(event.dataTransfer?.dropEffect).toBe('none');
  }

  // a "drop" event won't fire
  fireEvent.dragEnd(draggableEl);

  expect(ordered).toEqual(['drop']);

  cleanup();
});
