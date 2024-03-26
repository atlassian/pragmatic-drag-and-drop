// Note: not using '@testing-library/dom' in this file as it can
// add it's own "error" event listeners when other events are being fired
// This file uses vanilla event firing so that we are in total control

import { combine } from '../../../src/entry-point/combine';
import { appendToBody, getElements } from '../_util';

// The initiating "dragstart" event listener is added to the `document` for the element event listener
const documentAddEventListener = jest.spyOn(document, 'addEventListener');
const documentRemoveEventListener = jest.spyOn(document, 'removeEventListener');

// Event listeners for the drag are added to the window
const windowAddEventListener = jest.spyOn(window, 'addEventListener');
const windowRemoveEventListener = jest.spyOn(window, 'removeEventListener');

jest.resetModules();

afterEach(() => {
  windowAddEventListener.mockClear();
  windowRemoveEventListener.mockClear();
  documentAddEventListener.mockClear();
  documentRemoveEventListener.mockClear();
  jest.resetModules();
});

afterEach(async () => {
  // cleanup any pending drags
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  // Flushing postDropBugFix
  await 'microtask';
  window.dispatchEvent(new Event('pointerdown'));
});

it('should add event listeners when the first draggable is mounted', () => {
  // listeners not added as nothing imported yet
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(documentAddEventListener).not.toHaveBeenCalled();

  // import our draggable
  const { draggable } = require('../../../src/entry-point/element/adapter');

  // listeners not added as no draggables are registered yet
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(documentAddEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbind = combine(
    appendToBody(A),
    draggable({
      element: A,
    }),
  );

  // initial listener added after registration
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).not.toHaveBeenCalled();
  unbind();
});

it('should not add event listeners when multiple draggables are mounted', () => {
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(documentAddEventListener).not.toHaveBeenCalled();
  const { draggable } = require('../../../src/entry-point/element/adapter');

  const [A, B] = getElements('div');
  const unbind = combine(
    draggable({
      element: A,
    }),
    draggable({
      element: B,
    }),
  );

  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).not.toHaveBeenCalled();
  unbind();
});

it('should not add event listeners when only a drop target is mounted', () => {
  const {
    dropTargetForElements,
  } = require('../../../src/entry-point/element/adapter');

  const [el] = getElements('div');
  const unbind = combine(
    appendToBody(el),
    dropTargetForElements({
      element: el,
    }),
  );

  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(documentAddEventListener).not.toHaveBeenCalled();
  unbind();
});

it('should remove initiating event listener when an only draggable is removed', () => {
  const { draggable } = require('../../../src/entry-point/element/adapter');

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    draggable({
      element: A,
    }),
  );

  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).toHaveBeenCalledTimes(0);
  // nothing removed yet
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  unbindA();

  expect(documentRemoveEventListener).toHaveBeenCalledTimes(1);
  expect(windowRemoveEventListener).not.toHaveBeenCalled();
});

it('should remove initiating event listener when the last draggable is removed', () => {
  const { draggable } = require('../../../src/entry-point/element/adapter');

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A, B] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    draggable({
      element: A,
    }),
  );
  const unbindB = combine(
    appendToBody(B),
    draggable({
      element: B,
    }),
  );

  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).toHaveBeenCalledTimes(0);
  // nothing removed yet
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  unbindA();

  // not removed yet
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  unbindB();

  expect(documentRemoveEventListener).toHaveBeenCalledTimes(1);
  expect(windowRemoveEventListener).not.toHaveBeenCalled();
});

it('should bind event listeners needed for the drag only while dragging (drag cancelled)', async () => {
  const { draggable } = require('../../../src/entry-point/element/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('preview'),
      onDragStart: () => ordered.push('start'),
      onDrop: () => ordered.push('drop'),
    }),
  );

  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).not.toHaveBeenCalled();

  // let's start a drag
  A.dispatchEvent(
    new DragEvent('dragstart', { cancelable: true, bubbles: true }),
  );
  // @ts-expect-error
  requestAnimationFrame.step();
  expect(ordered).toEqual(['preview', 'start']);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postLiftWindowAddEventListenerCount =
    windowAddEventListener.mock.calls.length;
  expect(postLiftWindowAddEventListenerCount).toBeGreaterThan(1);
  // unchanged
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);

  // cancel the current drag
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  expect(ordered).toEqual(['drop']);

  // all new event listeners have been removed
  expect(windowRemoveEventListener).toHaveBeenCalledTimes(
    postLiftWindowAddEventListenerCount,
  );

  // unchanged
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(documentRemoveEventListener).not.toHaveBeenCalled();

  unbindA();
});

it('should bind event listeners needed for the drag only while dragging (successful drop)', () => {
  const {
    draggable,
    dropTargetForElements,
  } = require('../../../src/entry-point/element/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: A,
      onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
      onDragStart: () => ordered.push('dropTarget:start'),
      onDrop: () => ordered.push('dropTarget:drop'),
    }),
  );

  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(windowAddEventListener).not.toHaveBeenCalled();

  // let's start a drag
  A.dispatchEvent(
    new DragEvent('dragstart', { cancelable: true, bubbles: true }),
  );
  // @ts-expect-error
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:preview',
    'dropTarget:preview',
    'draggable:start',
    'dropTarget:start',
  ]);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postLiftWindowAddEventListenerCount =
    windowAddEventListener.mock.calls.length;
  expect(postLiftWindowAddEventListenerCount).toBeGreaterThan(1);
  // unchanged
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);

  // drop on A
  A.dispatchEvent(new DragEvent('drop', { cancelable: true, bubbles: true }));

  expect(ordered).toEqual(['draggable:drop', 'dropTarget:drop']);

  // all new event listeners have been removed
  expect(windowRemoveEventListener).toHaveBeenCalledTimes(
    postLiftWindowAddEventListenerCount,
  );

  // unchanged
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  expect(documentRemoveEventListener).not.toHaveBeenCalled();

  unbindA();
});

it('should keep dragging event listeners bound even if only draggable is removed mid drag', () => {
  const {
    draggable,
    monitorForElements,
  } = require('../../../src/entry-point/element/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );
  const unbindMonitor = monitorForElements({
    onGenerateDragPreview: () => ordered.push('monitor:preview'),
    onDragStart: () => ordered.push('monitor:start'),
    onDrop: () => ordered.push('monitor:drop'),
  });

  // initiating event listener added
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  // Note: Cannot reset the mock. It causes internal reference mismatches
  // documentAddEventListener.mockReset();
  // no dragging event listeners added
  expect(windowAddEventListener).not.toHaveBeenCalled();

  // let's start a drag
  A.dispatchEvent(
    new DragEvent('dragstart', { cancelable: true, bubbles: true }),
  );
  // @ts-expect-error
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable:preview',
    'monitor:preview',
    'draggable:start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postLiftAddEventListenerCount =
    windowAddEventListener.mock.calls.length;
  expect(postLiftAddEventListenerCount).toBeGreaterThan(0);
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  // unbinding the only draggable mid drag
  unbindA();
  // "dragstart" event listener removed on the `document`,
  // but other event listeners for the drag are still active
  expect(documentRemoveEventListener).toHaveBeenCalledTimes(1);
  expect(windowRemoveEventListener).toHaveBeenCalledTimes(0);

  // finish the drag
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  // monitor still told about the drop
  expect(ordered).toEqual(['monitor:drop']);

  // all dragging event listeners removed
  expect(windowRemoveEventListener).toHaveBeenCalledTimes(
    postLiftAddEventListenerCount,
  );

  unbindMonitor();
});

it('should keep dragging event listeners bound if only draggable is remounted mid drag', () => {
  const {
    draggable,
    monitorForElements,
  } = require('../../../src/entry-point/element/adapter');
  const ordered: string[] = [];

  // no event listeners added or removed yet
  expect(documentAddEventListener).not.toHaveBeenCalled();
  expect(documentRemoveEventListener).not.toHaveBeenCalled();
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [A] = getElements('div');
  const unbindA1 = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('draggable(1):preview'),
      onDragStart: () => ordered.push('draggable(1):start'),
      onDrop: () => ordered.push('draggable(1):drop'),
    }),
  );
  const unbindMonitor = monitorForElements({
    onGenerateDragPreview: () => ordered.push('monitor:preview'),
    onDragStart: () => ordered.push('monitor:start'),
    onDrop: () => ordered.push('monitor:drop'),
  });

  // initiating event listener added
  expect(documentAddEventListener).toHaveBeenCalledTimes(1);
  // Note: Cannot reset the mock. It causes internal reference mismatches
  // documentAddEventListener.mockReset();
  // no dragging event listeners added
  expect(windowAddEventListener).not.toHaveBeenCalled();

  // let's start a drag
  A.dispatchEvent(
    new DragEvent('dragstart', { cancelable: true, bubbles: true }),
  );
  // @ts-expect-error
  requestAnimationFrame.step();
  expect(ordered).toEqual([
    'draggable(1):preview',
    'monitor:preview',
    'draggable(1):start',
    'monitor:start',
  ]);
  ordered.length = 0;

  // we expect that *new* event listeners have been added for the duration of a the drag
  const postListWindowAddEventListenerCount =
    windowAddEventListener.mock.calls.length;
  expect(postListWindowAddEventListenerCount).toBeGreaterThan(0);
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  // unbinding the only draggable mid drag
  unbindA1();
  // "dragstart" event listener removed, but other event listeners for the drag are still active
  expect(documentRemoveEventListener).toHaveBeenCalledTimes(1);

  const unbindA2 = combine(
    appendToBody(A),
    draggable({
      element: A,
      onGenerateDragPreview: () => ordered.push('draggable(2):preview'),
      onDragStart: () => ordered.push('draggable(2):start'),
      onDrop: () => ordered.push('draggable(2):drop'),
    }),
  );

  // Due to new registration, a new "dragstart" event listener is added to the document
  expect(documentAddEventListener).toHaveBeenCalledTimes(2);

  // finish the drag
  window.dispatchEvent(
    new DragEvent('dragend', { cancelable: true, bubbles: true }),
  );

  // because 'A' is the key, A2 is treated as the original draggable
  expect(ordered).toEqual(['draggable(2):drop', 'monitor:drop']);

  // all event listeners removed (including initiating event listener)
  expect(windowRemoveEventListener).toHaveBeenCalledTimes(
    postListWindowAddEventListenerCount,
  );

  unbindMonitor();
  unbindA2();
});
