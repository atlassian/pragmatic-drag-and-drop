import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { autoScrollForElements } from '../../../src/entry-point/element';
import { unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';
import { getInternalConfig } from '../../../src/shared/configuration';
import {
  advanceTimersToNextFrame,
  appendToBody,
  reset,
  setElementFromPointToBe,
  setStartSystemTime,
  setupBasicScrollContainer,
  stepScrollBy,
  userEvent,
} from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers('modern');
setStartSystemTime();

beforeEach(reset);

const defaultConfig = getInternalConfig();
const maxScrollPerFrame = defaultConfig.maxPixelScrollPerSecond / 60;

it('should dampen the acceleration of auto scrolling [new drag] - up', () => {
  const { parentScrollContainer, child } = setupBasicScrollContainer();
  const ordered: string[] = [];
  const scrollHistory: number[] = [parentScrollContainer.scrollTop];

  let unsetElementAtPoint = setElementFromPointToBe(child);
  const cleanup = combine(
    appendToBody(parentScrollContainer),
    draggable({
      element: child,
      onDragStart: () => ordered.push('draggable:start'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
    dropTargetForElements({
      element: parentScrollContainer,
      onDragStart: () => ordered.push('dropTarget:start'),
      onDrop: () => ordered.push('dropTarget:drop'),
      onDragEnter: () => ordered.push('dropTarget:enter'),
      onDragLeave: () => ordered.push('dropTarget:leave'),
    }),
    autoScrollForElements({
      element: parentScrollContainer,
    }),
    unsafeOverflowAutoScrollForElements({
      element: parentScrollContainer,
      getOverflow: () => ({
        fromBottomEdge: {
          bottom: 1000,
          left: 0,
          right: 0,
        },
      }),
    }),
    bind(parentScrollContainer, {
      type: 'scroll',
      listener() {
        ordered.push(`scroll event`);
        scrollHistory.push(parentScrollContainer.scrollTop);
      },
    }),
  );

  const onBottomEdge: Position = {
    x:
      parentScrollContainer.getBoundingClientRect().left +
      parentScrollContainer.getBoundingClientRect().width / 2,
    y: parentScrollContainer.getBoundingClientRect().bottom,
  };
  const belowBottomEdge: Position = {
    x: onBottomEdge.x,
    y: onBottomEdge.y + 10,
  };

  // lifting on the mid point of the bottom edge
  userEvent.lift(child, {
    clientX: onBottomEdge.x,
    clientY: onBottomEdge.y,
  });

  expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);
  ordered.length = 0;

  // on first frame, there is no auto scroll as
  // we don't know what the scroll speed should be until
  // a single frame has passed
  advanceTimersToNextFrame();
  stepScrollBy();

  // scroll container has still not scrolled
  expect(ordered).toEqual([]);
  expect(parentScrollContainer.scrollTop).toBe(scrollHistory.at(-1));

  // expecting scroll on second frame
  advanceTimersToNextFrame();
  stepScrollBy();
  expect(ordered).toEqual(['scroll event']);
  ordered.length = 0;

  function dragBelowParent() {
    unsetElementAtPoint();
    unsetElementAtPoint = setElementFromPointToBe(document.body);
    fireEvent.dragEnter(document.body, {
      clientX: belowBottomEdge.x,
      clientY: belowBottomEdge.y,
    });
    expect(ordered).toEqual(['dropTarget:leave']);
    ordered.length = 0;
  }
  function dragOntoParentBottomEdge() {
    unsetElementAtPoint();
    unsetElementAtPoint = setElementFromPointToBe(child);
    fireEvent.dragEnter(child, {
      clientX: onBottomEdge.x,
      clientY: onBottomEdge.y,
    });
    expect(ordered).toEqual(['dropTarget:enter']);
    ordered.length = 0;
  }

  // engagement will be recorded during the first scroll event
  const engagementStart = Date.now();

  function isInTimeDampeningPeriod() {
    return Date.now() - engagementStart < defaultConfig.timeDampeningDurationMs;
  }

  let lastScrollChange = 0;
  const hit = jest.fn();
  const actions = [dragBelowParent, dragOntoParentBottomEdge];

  while (isInTimeDampeningPeriod()) {
    actions.forEach(action => {
      // the first action might have taken us over the time dampening period
      if (!isInTimeDampeningPeriod()) {
        return;
      }
      hit();

      const before = parentScrollContainer.scrollTop;
      // okay, let's leave the drop target
      action();
      // The next frame will be scrolled by the over flow auto scroller
      advanceTimersToNextFrame();
      stepScrollBy();

      expect(ordered).toEqual(['scroll event']);
      ordered.length = 0;

      const after = parentScrollContainer.scrollTop;
      const scrollChange = after - before;
      expect(scrollChange).toBeGreaterThan(lastScrollChange);

      lastScrollChange = scrollChange;
    });
  }

  // expecting each action to have been called at least once each
  expect(hit.mock.calls.length).toBeGreaterThan(actions.length);

  // Based on what the tim dampening period it is, we might be mid way through
  // the actions. This is being a bit resilient by checking what
  // action we are up to and continuing from there
  const nextActionIndex = hit.mock.calls.length % actions.length;
  const nextAction = actions[nextActionIndex];
  const next = [
    nextAction,
    nextAction === dragBelowParent ? dragOntoParentBottomEdge : dragBelowParent,
  ];

  // now that we are outside of the time dampening period, expecting no time dampening
  next.forEach(action => {
    const before = parentScrollContainer.scrollTop;
    // okay, let's leave the drop target
    action();
    // The next frame will be scrolled by the over flow auto scroller
    advanceTimersToNextFrame();
    stepScrollBy();

    expect(ordered).toEqual(['scroll event']);
    ordered.length = 0;

    const after = parentScrollContainer.scrollTop;
    const scrollChange = after - before;
    expect(scrollChange).toBe(maxScrollPerFrame);
  });

  cleanup();
});
