import { getRect } from 'css-box-model';

import type { Scrollable } from './types';

// Simplified version of RBD's droppable: minimum required fields just to get it working with cursor-based scolling.
export const getScrollable = ({
  closestScrollable,
}: {
  closestScrollable: Element;
}): Scrollable => {
  const rect: DOMRect = closestScrollable.getBoundingClientRect();
  const scrollPosition = {
    x: closestScrollable.scrollLeft,
    y: closestScrollable.scrollTop,
  };

  return {
    container: getRect(rect),
    scroll: {
      current: scrollPosition,
      max: {
        x: closestScrollable.scrollWidth - closestScrollable.clientWidth,
        y: closestScrollable.scrollHeight - closestScrollable.clientHeight,
      },
    },
  };
};
