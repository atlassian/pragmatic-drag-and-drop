import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { type Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import { isWithin } from '../../../src/shared/is-within';
import {
  advanceTimersToNextFrame,
  appendToBody,
  reset,
  setElementFromPointToBe,
  setStartSystemTime,
  setupNestedScrollContainers,
  stepScrollBy,
  userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

test('a parent should allow a child to be overflow scrolled (when the parent is registered before the child)', () => {
  const [child, parent, grandParent] = setupNestedScrollContainers([
    // child
    { width: 10000, height: 10000 },
    // parent
    // We are making space above the the `parent` so
    // that it can have overflow scrolling inside of the `grandParent`.
    // We want to check that the `grandParent` does not block
    // auto scrolling of it's children
    { width: 5000, height: 5000, x: 0, y: 10 },
    // grandparent,
    { width: 1000, height: 1000 },
  ]);

  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(grandParent),
    draggable({
      element: child,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: child,
      onDragStart: () => ordered.push('child:start'),
      onDrop: () => ordered.push('child:drop'),
    }),
    dropTargetForElements({
      element: parent,
      onDragStart: () => ordered.push('parent:start'),
      onDrop: () => ordered.push('parent:drop'),
    }),
    dropTargetForElements({
      element: grandParent,
      onDragStart: () => ordered.push('grandParent:start'),
      onDrop: () => ordered.push('grandParent:drop'),
    }),
    // Registering the `grandParent` first.
    // We are testing that when `grandParent` cannot be scrolled,
    // `parent` still can be.
    unsafeOverflowAutoScrollForElements({
      element: grandParent,
      getOverflow: () => ({
        fromTopEdge: {
          left: 0,
          right: 0,
          top: 100,
        },
      }),
    }),
    unsafeOverflowAutoScrollForElements({
      element: parent,
      getOverflow: () => ({
        fromTopEdge: {
          left: 0,
          right: 0,
          top: 100,
        },
      }),
    }),
    setElementFromPointToBe(child),
    bind(window, {
      type: 'scroll',
      listener: event => {
        if (event.target === grandParent) {
          ordered.push('grandParent:scroll');
          return;
        }
        if (event.target === parent) {
          // console.log('parent', parent.scrollTop, parent.scrollLeft);
          ordered.push('parent:scroll');
          return;
        }
        ordered.push('unknown:scroll');
      },
      // scroll events do not bubble, so leveraging the capture phase
      options: { capture: true },
    }),
  );
  let unsetElementFromPoint = setElementFromPointToBe(child);

  // Set some initial scroll on the scroll containers
  // These are in the range where auto scrolling will occur on both
  parent.scrollTop = 2;
  grandParent.scrollTop = 2;

  // lifting the mid point visible area
  userEvent.lift(child, {
    clientX:
      grandParent.getBoundingClientRect().left +
      grandParent.getBoundingClientRect().width / 2,
    clientY:
      grandParent.getBoundingClientRect().top +
      grandParent.getBoundingClientRect().height / 2,
  });

  expect(ordered).toEqual([
    'draggable:start',
    'child:start',
    'parent:start',
    'grandParent:start',
  ]);
  ordered.length = 0;

  // on first frame, there is no auto scroll as
  // we don't know what the scroll speed should be until
  // a single frame has passed
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual([]);

  // on second frame there will be no auto scrolling as we have not set up "over element"
  // auto scrolling
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual([]);

  const aboveParent: Position = {
    x:
      grandParent.getBoundingClientRect().left +
      grandParent.getBoundingClientRect().width / 2,
    // over grandParent, but in the overflow scroll area of parent
    y: grandParent.getBoundingClientRect().top + 2,
  };

  // validating our point is where we expect
  expect(
    isWithin({
      client: aboveParent,
      clientRect: grandParent.getBoundingClientRect(),
    }),
  ).toBe(true);
  expect(
    isWithin({
      client: aboveParent,
      clientRect: parent.getBoundingClientRect(),
    }),
  ).toBe(false);

  // moving above parent sibling
  fireEvent.dragOver(grandParent, {
    clientX: aboveParent.x,
    clientY: aboveParent.y,
  });
  unsetElementFromPoint();
  unsetElementFromPoint = setElementFromPointToBe(grandParent);

  // now expecting just the parent to scroll
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual(['parent:scroll']);
  ordered.length = 0;

  cleanup();
});

test('a parent should allow a child to be overflow scrolled (when the parent is registered after the child)', () => {
  const [child, parent, grandParent] = setupNestedScrollContainers([
    // child
    { width: 10000, height: 10000 },
    // parent
    // We are making space above the the `parent` so
    // that it can have overflow scrolling inside of the `grandParent`.
    // We want to check that the `grandParent` does not block
    // auto scrolling of it's children
    { width: 5000, height: 5000, x: 0, y: 10 },
    // grandparent,
    { width: 1000, height: 1000 },
  ]);

  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(grandParent),
    draggable({
      element: child,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: child,
      onDragStart: () => ordered.push('child:start'),
      onDrop: () => ordered.push('child:drop'),
    }),
    dropTargetForElements({
      element: parent,
      onDragStart: () => ordered.push('parent:start'),
      onDrop: () => ordered.push('parent:drop'),
    }),
    dropTargetForElements({
      element: grandParent,
      onDragStart: () => ordered.push('grandParent:start'),
      onDrop: () => ordered.push('grandParent:drop'),
    }),
    // Registering the `parent` first.
    // We are testing that when `grandParent` cannot be scrolled,
    // `parent` still can be.
    unsafeOverflowAutoScrollForElements({
      element: parent,
      getOverflow: () => ({
        fromTopEdge: {
          left: 0,
          right: 0,
          top: 100,
        },
      }),
    }),
    unsafeOverflowAutoScrollForElements({
      element: grandParent,
      getOverflow: () => ({
        fromTopEdge: {
          left: 0,
          right: 0,
          top: 100,
        },
      }),
    }),
    setElementFromPointToBe(child),
    bind(window, {
      type: 'scroll',
      listener: event => {
        if (event.target === grandParent) {
          ordered.push('grandParent:scroll');
          return;
        }
        if (event.target === parent) {
          // console.log('parent', parent.scrollTop, parent.scrollLeft);
          ordered.push('parent:scroll');
          return;
        }
        ordered.push('unknown:scroll');
      },
      // scroll events do not bubble, so leveraging the capture phase
      options: { capture: true },
    }),
  );
  let unsetElementFromPoint = setElementFromPointToBe(child);

  // Set some initial scroll on the scroll containers
  // These are in the range where auto scrolling will occur on both
  parent.scrollTop = 2;
  grandParent.scrollTop = 2;

  // lifting the mid point visible area
  userEvent.lift(child, {
    clientX:
      grandParent.getBoundingClientRect().left +
      grandParent.getBoundingClientRect().width / 2,
    clientY:
      grandParent.getBoundingClientRect().top +
      grandParent.getBoundingClientRect().height / 2,
  });

  expect(ordered).toEqual([
    'draggable:start',
    'child:start',
    'parent:start',
    'grandParent:start',
  ]);
  ordered.length = 0;

  // on first frame, there is no auto scroll as
  // we don't know what the scroll speed should be until
  // a single frame has passed
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual([]);

  // on second frame there will be no auto scrolling as we have not set up "over element"
  // auto scrolling
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual([]);

  const aboveParent: Position = {
    x:
      grandParent.getBoundingClientRect().left +
      grandParent.getBoundingClientRect().width / 2,
    // over grandParent, but in the overflow scroll area of parent
    y: grandParent.getBoundingClientRect().top + 2,
  };

  // validating our point is where we expect
  expect(
    isWithin({
      client: aboveParent,
      clientRect: grandParent.getBoundingClientRect(),
    }),
  ).toBe(true);
  expect(
    isWithin({
      client: aboveParent,
      clientRect: parent.getBoundingClientRect(),
    }),
  ).toBe(false);

  // moving above parent sibling
  fireEvent.dragOver(grandParent, {
    clientX: aboveParent.x,
    clientY: aboveParent.y,
  });
  unsetElementFromPoint();
  unsetElementFromPoint = setElementFromPointToBe(grandParent);

  // now expecting just the parent to scroll
  advanceTimersToNextFrame();
  stepScrollBy();

  expect(ordered).toEqual(['parent:scroll']);
  ordered.length = 0;

  cleanup();
});
