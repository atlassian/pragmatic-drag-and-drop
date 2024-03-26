// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Rect } from 'css-box-model';

import type { Axis, Spacing } from '../../types';

import getDistanceThresholds from './get-distance-thresholds';
import getValue from './get-value';

type GetOnAxisArgs = {
  container: Rect;
  distanceToEdges: Spacing;
  dragStartTime: number;
  axis: Axis;
  shouldUseTimeDampening: boolean;
};

export default ({
  container,
  distanceToEdges,
  dragStartTime,
  axis,
  shouldUseTimeDampening,
}: GetOnAxisArgs): number => {
  const thresholds = getDistanceThresholds(container, axis);
  const isCloserToEnd: boolean =
    distanceToEdges[axis.end] < distanceToEdges[axis.start];

  if (isCloserToEnd) {
    return getValue({
      distanceToEdge: distanceToEdges[axis.end],
      thresholds,
      dragStartTime,
      shouldUseTimeDampening,
    });
  }

  return (
    -1 *
    getValue({
      distanceToEdge: distanceToEdges[axis.start],
      thresholds,
      dragStartTime,
      shouldUseTimeDampening,
    })
  );
};
