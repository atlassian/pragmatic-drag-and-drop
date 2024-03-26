// Source: https://github.com/atlassian/react-beautiful-dnd

import { minScroll } from '../../constants';

import { dampenValueByTime } from './dampen-value-by-time';
import type { DistanceThresholds } from './get-distance-thresholds';
import { getValueFromDistance } from './get-value-from-distance';

type Args = {
  distanceToEdge: number;
  thresholds: DistanceThresholds;
  dragStartTime: number;
  shouldUseTimeDampening: boolean;
};

export const getValue = ({
  distanceToEdge,
  thresholds,
  dragStartTime,
  shouldUseTimeDampening,
}: Args): number => {
  const scroll: number = getValueFromDistance(distanceToEdge, thresholds);

  // not enough distance to trigger a minimum scroll
  // we can bail here
  if (scroll === 0) {
    return 0;
  }

  // Dampen an auto scroll speed based on duration of drag

  if (!shouldUseTimeDampening) {
    return scroll;
  }

  // Once we know an auto scroll should occur based on distance,
  // we must let at least 1px through to trigger a scroll event an
  // another auto scroll call

  return Math.max(dampenValueByTime(scroll, dragStartTime), minScroll);
};

export default getValue;
