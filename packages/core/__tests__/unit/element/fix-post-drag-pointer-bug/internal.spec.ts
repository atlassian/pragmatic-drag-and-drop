import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { monitorForTextSelection } from '../../../../src/entry-point/text-selection/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  nativeDrag,
  reset,
  setElementFromPoint,
  userEvent,
} from '../../_util';

afterEach(reset);

/**
 * Ideally we would be validating the bug still exists, and that our fix works, through browser tests.
 * However, I could not get puppeteer to replicate the browser bug, so some basic unit tests is
 * all we can do at this stage 😢
 * External drags are separated out into a separate file as the external adapter adds it's
 * own "always on" event listeners that mess up some of the counting logic in this file
 */

function findStyleElement(): HTMLStyleElement | null {
  return document.querySelector('head style[pdnd-post-drag-fix]');
}

function getStyleElement(): HTMLStyleElement {
  const element = findStyleElement();
  invariant(element, 'Could not find style sheet');
  return element;
}

it('should apply the fix after a microtask to allow frameworks to update the UI in a microtask', async () => {
  const [target] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(target),
    draggable({
      element: target,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: target,
      onDragStart: () => ordered.push('dropTarget:start'),
      onDrop: () => ordered.push('dropTarget:drop'),
    }),
  );

  userEvent.lift(target);
  userEvent.drop(target);
  expect(ordered).toEqual([
    'draggable:start',
    'dropTarget:start',
    'draggable:drop',
    'dropTarget:drop',
  ]);

  expect(findStyleElement()).toBe(null);

  await 'microtask';

  expect(findStyleElement()).toBeTruthy();

  cleanup();
});

test('the fix should block pointer events on all elements except for the one under the users pointer (successful drop)', async () => {
  const [X, dropTarget] = getElements('div');

  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  const style = getStyleElement();

  // new style element added to the <head>
  expect(document.head.contains(style));

  // pointer events blocked on all elements
  expect(style.sheet?.cssRules.length).toBe(1);
  expect(style.sheet?.cssRules[0]?.cssText).toBe(
    '* {pointer-events: none !important;}',
  );

  // pointer events allowed on the element under the users cursor
  expect(dropTarget.style.pointerEvents).toBe('auto');
  expect(dropTarget.style.cssText).toBe('pointer-events: auto !important;');

  cleanups.forEach(cleanup => cleanup());
});

test('the fix should block pointer events on all elements except for the one under the users pointer (cancelled drag)', async () => {
  const [X, dropTarget] = getElements('div');
  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDragLeave: () => ordered.push('dropTarget:leave'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  // cancel the drag
  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.cancel(dropTarget);
  expect(ordered).toEqual(['dropTarget:leave', 'X:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // fix applied
  expect(findStyleElement()).toBeTruthy();
  expect(dropTarget.style.pointerEvents).toBe('auto');
  expect(dropTarget.style.cssText).toBe('pointer-events: auto !important;');

  cleanups.forEach(cleanup => cleanup());
});

test('an inline pointer-events style on the element under the users pointer should be restored after the drag is finished', async () => {
  const [X, dropTarget] = getElements('div');
  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );
  dropTarget.style.setProperty('pointer-events', 'none', 'important');
  // little validation that we did the setup correctly
  expect(dropTarget.style.cssText).toBe('pointer-events: none !important;');

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // checking fix is applied
  expect(findStyleElement()).toBeTruthy();

  // pointer events now enabled on the element
  expect(dropTarget.style.cssText).toBe('pointer-events: auto !important;');

  // releasing fix
  fireEvent.pointerMove(document.body);

  // original value and !important restored
  expect(dropTarget.style.cssText).toBe('pointer-events: none !important;');

  cleanups.forEach(cleanup => cleanup());
});

test('inline styles applied to the element under the users pointer should not impact other inline styles on the item', async () => {
  const [X, dropTarget] = getElements('div');
  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );
  // giving our drop target a sweet red inline background color
  dropTarget.style.backgroundColor = 'red';

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // checking fix is applied
  expect(findStyleElement()).toBeTruthy();

  // pointer events now enabled on the element
  expect(dropTarget.style.pointerEvents).toBe('auto');

  // existing background inline property still intact
  expect(dropTarget.style.backgroundColor).toBe('red');

  // only the properties are there that we expect
  expect(dropTarget.style.cssText).toBe(
    'background-color: red; pointer-events: auto !important;',
  );

  // releasing fix
  fireEvent.pointerMove(document.body);

  // existing background inline property still intact
  expect(dropTarget.style.backgroundColor).toBe('red');
  expect(dropTarget.style.cssText).toBe('background-color: red;');

  cleanups.forEach(cleanup => cleanup());
});

test('pointer-events should be blocked on children + parents of the element under the users pointer', async () => {
  const [X] = getElements('div');
  const [child, dropTarget, parent] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );
  // checking child does not have pointer-events modified
  expect(window.getComputedStyle(child).pointerEvents).toBe('');
  expect(window.getComputedStyle(parent).pointerEvents).toBe('');

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // checking fix is applied
  expect(findStyleElement()).toBeTruthy();

  // pointer-events now blocked on the child + parent
  expect(window.getComputedStyle(child).pointerEvents).toBe('none');
  expect(window.getComputedStyle(parent).pointerEvents).toBe('none');

  // releasing fix
  fireEvent.pointerMove(document.body);

  // pointer-events are allowed again
  expect(window.getComputedStyle(child).pointerEvents).toBe('');
  expect(window.getComputedStyle(parent).pointerEvents).toBe('');

  cleanups.forEach(cleanup => cleanup());
});

test('pointer-events should be blocked on elements that enable pointer-events as an inline style', async () => {
  const [X] = getElements('div');
  const [child, dropTarget, parent] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      appendToBody(X),
      draggable({
        element: X,
        onDragStart: () => ordered.push('X:start'),
        onDrop: () => ordered.push('X:drop'),
      }),
      dropTargetForElements({
        element: dropTarget,
        onDragStart: () => ordered.push('dropTarget:start'),
        onDragEnter: () => ordered.push('dropTarget:enter'),
        onDrop: () => ordered.push('dropTarget:drop'),
      }),
    ),
  );

  child.style.pointerEvents = 'auto';
  parent.style.pointerEvents = 'auto';
  expect(window.getComputedStyle(child).pointerEvents).toBe('auto');
  expect(window.getComputedStyle(parent).pointerEvents).toBe('auto');

  userEvent.lift(X);
  expect(ordered).toEqual(['X:start']);
  ordered.length = 0;

  fireEvent.dragEnter(dropTarget);
  expect(ordered).toEqual(['dropTarget:enter']);
  ordered.length = 0;

  cleanups.push(setElementFromPoint(dropTarget));
  userEvent.drop(dropTarget);
  expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

  // fix not yet applied
  expect(findStyleElement()).toBe(null);

  // after a microtask the fix will be applied
  await 'microtask';

  // checking fix is applied
  expect(findStyleElement()).toBeTruthy();

  // computing the `child` and `parent` styles
  // pointer-events now blocked on the child + parent
  // 👋 These assertions are currently not working as window.getComputedStyles()
  // is not being computed correctly in jsdom
  // expect(window.getComputedStyle(child).pointerEvents).toBe('none');
  // expect(window.getComputedStyle(parent).pointerEvents).toBe('none');

  // re-enable test if jsdom improves
  if (window.getComputedStyle(child).pointerEvents === 'none') {
    // eslint-disable-next-line no-console
    console.warn(
      'jsdom bug fixed: can re-enable getComputedStyle() checks in this test',
    );
  }

  // releasing fix
  fireEvent.pointerMove(document.body);

  // original value restored
  expect(window.getComputedStyle(child).pointerEvents).toBe('auto');
  expect(window.getComputedStyle(parent).pointerEvents).toBe('auto');

  cleanups.forEach(cleanup => cleanup());
});

// Using this approach so we can ensure that correct event contructers are being used
type Item = {
  eventName: string;
  fireEvent: (target: Element | Window) => void;
};

const items: Item[] = [
  {
    eventName: 'pointerdown',
    fireEvent: target => fireEvent.pointerDown(target),
  },
  {
    eventName: 'pointermove',
    fireEvent: target => fireEvent.pointerMove(target),
  },
  {
    eventName: 'focusin',
    fireEvent: target => fireEvent.focusIn(target),
  },
  {
    eventName: 'focusout',
    fireEvent: target => fireEvent.focusOut(target),
  },
  {
    eventName: 'dragstart',
    fireEvent: target => fireEvent.dragStart(target),
  },
  {
    eventName: 'dragenter',
    fireEvent: target => fireEvent.dragEnter(target),
  },
  {
    eventName: 'dragover',
    fireEvent: target => fireEvent.dragOver(target),
  },
];

items.forEach(item => {
  it(`should remove the fix after a user interaction [trigger: ${item.eventName}]`, async () => {
    const [X, dropTarget] = getElements('div');

    const ordered: string[] = [];
    const cleanups: (() => void)[] = [];
    cleanups.push(
      combine(
        appendToBody(dropTarget),
        appendToBody(X),
        draggable({
          element: X,
          onDragStart: () => ordered.push('X:start'),
          onDrop: () => ordered.push('X:drop'),
        }),
        dropTargetForElements({
          element: dropTarget,
          onDragStart: () => ordered.push('dropTarget:start'),
          onDragEnter: () => ordered.push('dropTarget:enter'),
          onDrop: () => ordered.push('dropTarget:drop'),
        }),
      ),
    );

    userEvent.lift(X);
    expect(ordered).toEqual(['X:start']);
    ordered.length = 0;

    fireEvent.dragEnter(dropTarget);
    expect(ordered).toEqual(['dropTarget:enter']);
    ordered.length = 0;

    cleanups.push(setElementFromPoint(dropTarget));
    userEvent.drop(dropTarget);
    expect(ordered).toEqual(['X:drop', 'dropTarget:drop']);

    // fix not yet applied
    expect(findStyleElement()).toBe(null);

    // after a microtask the fix will be applied
    await 'microtask';

    // fix applied
    expect(findStyleElement()).toBeTruthy();
    expect(dropTarget.style.pointerEvents).toBe('auto');

    item.fireEvent(window);

    // fix no longer applied
    expect(findStyleElement()).toBeFalsy();
    expect(dropTarget.style.pointerEvents).toBe('');
  });
});

it('should not apply the fix for unmanaged draggables', async () => {
  const [managed, dropTarget] = getElements('div');
  const [unmanaged] = getElements('div');
  unmanaged.draggable = true;

  const ordered: string[] = [];
  const cleanups: (() => void)[] = [];
  cleanups.push(
    combine(
      appendToBody(dropTarget),
      draggable({
        element: managed,
      }),
      monitorForElements({
        onDragStart: () => ordered.push('monitor(element):start'),
      }),
      monitorForTextSelection({
        onDragStart: () => ordered.push('monitor(text-selection):start'),
      }),
    ),
  );

  nativeDrag.startInternal({
    items: [{ data: 'Hello', type: 'text/plain' }],
    target: unmanaged,
  });

  expect(ordered).toEqual([]);
  ordered.length = 0;

  // fix not applied (drag is still occurring)
  expect(findStyleElement()).toBe(null);

  userEvent.cancel();

  // after a microtask the fix won't be applied
  await 'microtask';

  // fix not applied
  expect(findStyleElement()).toBe(null);

  cleanups.forEach(cleanup => cleanup());
});

test('ensure event listeners are cleaned up when the fix is removed', async () => {
  const windowAddEventListener = jest.spyOn(window, 'addEventListener');
  const windowRemoveEventListener = jest.spyOn(window, 'removeEventListener');

  // asserting our initial state
  expect(windowAddEventListener).not.toHaveBeenCalled();
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  const [target] = getElements('div');
  const ordered: string[] = [];
  const cleanup = combine(
    appendToBody(target),
    draggable({
      element: target,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: target,
      onDragStart: () => ordered.push('dropTarget:start'),
      onDrop: () => ordered.push('dropTarget:drop'),
    }),
  );

  userEvent.lift(target);

  userEvent.drop(target);
  expect(ordered).toEqual([
    'draggable:start',
    'dropTarget:start',
    'draggable:drop',
    'dropTarget:drop',
  ]);

  expect(findStyleElement()).toBe(null);

  windowAddEventListener.mockClear();
  windowRemoveEventListener.mockClear();

  // ticking the microtask will apply the fix
  await 'microtask';

  const amountAdded = windowAddEventListener.mock.calls.length;
  expect(amountAdded).toBeGreaterThan(0);
  expect(windowRemoveEventListener).not.toHaveBeenCalled();

  expect(findStyleElement()).toBeTruthy();

  // this will remove the fix
  fireEvent.pointerDown(document.body);
  expect(findStyleElement()).toBe(null);

  // No new event listeners added
  expect(windowAddEventListener).toHaveBeenCalledTimes(amountAdded);
  // All event listeners removed
  expect(removeEventListener).toHaveBeenCalledTimes(amountAdded);

  cleanup();
});
