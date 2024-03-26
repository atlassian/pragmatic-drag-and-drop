// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Rect } from 'css-box-model';

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { horizontal, vertical } from '../constants';
import { apply, isEqual, origin } from '../position';
import type { Spacing } from '../types';

import getScrollOnAxis from './get-scroll-on-axis';

// will replace -0 and replace with +0
const clean = apply((value: number) => (value === 0 ? 0 : value));

type Args = {
  dragStartTime: number;
  container: Rect;
  center: Position;
  shouldUseTimeDampening: boolean;
};

export default ({
  dragStartTime,
  container,
  center,
  shouldUseTimeDampening,
}: Args): Position | null => {
  // get distance to each edge
  const distanceToEdges: Spacing = {
    top: center.y - container.top,
    right: container.right - center.x,
    bottom: container.bottom - center.y,
    left: center.x - container.left,
  };

  // 1. Figure out which x,y values are the best target
  // 2. Can the container scroll in that direction at all?
  // If no for both directions, then return null
  // 3. Is the center close enough to a edge to start a drag?
  // 4. Based on the distance, calculate the speed at which a scroll should occur
  // The lower distance value the faster the scroll should be.
  // Maximum speed value should be hit before the distance is 0
  // Negative values to not continue to increase the speed
  const y: number = getScrollOnAxis({
    container,
    distanceToEdges,
    dragStartTime,
    axis: vertical,
    shouldUseTimeDampening,
  });
  const x: number = getScrollOnAxis({
    container,
    distanceToEdges,
    dragStartTime,
    axis: horizontal,
    shouldUseTimeDampening,
  });

  const required: Position = clean({ x, y });

  // nothing required
  if (isEqual(required, origin)) {
    return null;
  }

  return required;
};
