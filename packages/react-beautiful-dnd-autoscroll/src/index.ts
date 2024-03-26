import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { scroll } from './internal/scroll';
import { ScrollBehavior } from './internal/types';

type WhileDragging = {
  dragStartTime: number;
  latestInput: Input;
  loopFrameId: number | null;
  shouldUseTimeDampening: boolean;
  behavior: ScrollBehavior;
} | null;

const scrollElement = (element: Element, change: Position) => {
  element.scrollBy(change.x, change.y);
};

const scrollWindow = (change: Position) => {
  window.scrollBy(change.x, change.y);
};

export const createAutoScroller = () => {
  let dragging: WhileDragging = null;

  function tryScroll(fakeScrollCallback?: () => void) {
    if (dragging == null) {
      return;
    }

    scroll({
      input: dragging.latestInput,
      dragStartTime: dragging.dragStartTime,
      shouldUseTimeDampening: dragging.shouldUseTimeDampening,
      behavior: dragging.behavior,
      scrollElement: fakeScrollCallback ?? scrollElement,
      scrollWindow: fakeScrollCallback ?? scrollWindow,
    });
  }

  // Every animation frame use the latest user input to scroll
  // We do this loop manually rather than in response to `onDrag`
  // events as `onDrag` can drop to 50-100ms between events when
  // the user is not actively moving their pointer
  function loop() {
    if (!dragging) {
      return;
    }
    dragging.loopFrameId = requestAnimationFrame(() => {
      tryScroll();
      loop();
    });
  }

  const start = ({
    input,
    behavior = 'window-then-container',
  }: {
    input: Input;
    behavior?: ScrollBehavior;
  }) => {
    const dragStartTime: number = Date.now();

    dragging = {
      dragStartTime,
      latestInput: input,
      loopFrameId: null,
      shouldUseTimeDampening: false,
      behavior,
    };

    // we only use time dampening when auto scrolling starts on lift.
    const fakeScrollCallback = () => {
      if (dragging) {
        dragging.shouldUseTimeDampening = true;
      }
    };

    tryScroll(fakeScrollCallback);
    loop();
  };

  function updateInput({ input }: { input: Input }) {
    if (!dragging) {
      return;
    }
    dragging.latestInput = input;
  }

  const stop = () => {
    // can be called defensively
    if (!dragging) {
      return;
    }
    if (dragging.loopFrameId) {
      cancelAnimationFrame(dragging.loopFrameId);
    }
    dragging = null;
  };

  return { start, updateInput, stop };
};

export const autoScroller = createAutoScroller();
