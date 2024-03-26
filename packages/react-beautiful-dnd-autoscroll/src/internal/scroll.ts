import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { getClosestScrollableElement } from './get-closest-scrollable-element';
import { getScrollable } from './get-scrollable';
import getScrollableScrollChange from './get-scrollable-scroll-change';
import getWindowScrollChange from './get-window-scroll-change';
import type { Scrollable, ScrollBehavior } from './types';
import getViewport from './window/get-viewport';

type Args = {
  input: Input;
  dragStartTime: number;
  shouldUseTimeDampening: boolean;
  scrollElement: (element: Element, change: Position) => void;
  scrollWindow: (change: Position) => void;
  behavior: ScrollBehavior;
};

export const scroll = ({
  input,
  dragStartTime,
  shouldUseTimeDampening,
  scrollElement,
  scrollWindow,
  behavior,
}: Args) => {
  const tryScrollWindow = () => {
    const viewport = getViewport();
    const windowScrollChange: Position | null = getWindowScrollChange({
      dragStartTime,
      viewport,
      center: {
        x: input.clientX + viewport.scroll.current.x,
        y: input.clientY + viewport.scroll.current.y,
      },
      shouldUseTimeDampening,
    });

    if (windowScrollChange) {
      scrollWindow(windowScrollChange);
      return true;
    }

    return false;
  };

  const tryScrollContainer = () => {
    const over = document.elementFromPoint(input.clientX, input.clientY);
    const closestScrollable: Element | null = getClosestScrollableElement(over);

    if (!closestScrollable) {
      return false;
    }

    const scrollable: Scrollable = getScrollable({
      closestScrollable,
    });

    const scrollableScrollChange: Position | null = getScrollableScrollChange({
      dragStartTime,
      scrollable,
      center: { x: input.clientX, y: input.clientY },
      shouldUseTimeDampening,
    });

    if (scrollableScrollChange) {
      scrollElement(closestScrollable, scrollableScrollChange);
      return true;
    }

    return false;
  };

  if (behavior === 'container-only') {
    tryScrollContainer();
  }
  if (behavior === 'window-only') {
    tryScrollWindow();
  }
  if (behavior === 'container-then-window') {
    tryScrollContainer() || tryScrollWindow();
  }
  if (behavior === 'window-then-container') {
    tryScrollWindow() || tryScrollContainer();
  }
};
