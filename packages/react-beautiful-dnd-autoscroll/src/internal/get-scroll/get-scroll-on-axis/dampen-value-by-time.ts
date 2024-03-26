// Source: https://github.com/atlassian/react-beautiful-dnd

import config from '../../config';
import { minScroll } from '../../constants';
import { getPercentage } from '../../get-percentage';

const accelerateAt: number = config.durationDampening.accelerateAt;
const stopAt: number = config.durationDampening.stopDampeningAt;

export const dampenValueByTime = (
  proposedScroll: number,
  dragStartTime: number,
): number => {
  const startOfRange: number = dragStartTime;
  const endOfRange: number = stopAt;
  const now: number = Date.now();
  const runTime: number = now - startOfRange;

  // we have finished the time dampening period
  if (runTime >= stopAt) {
    return proposedScroll;
  }

  // Up to this point we know there is a proposed scroll
  // but we have not reached our accelerate point
  // Return the minimum amount of scroll
  if (runTime < accelerateAt) {
    return minScroll;
  }

  const betweenAccelerateAtAndStopAtPercentage: number = getPercentage({
    startOfRange: accelerateAt,
    endOfRange,
    current: runTime,
  });

  const scroll: number =
    proposedScroll * config.ease(betweenAccelerateAtAndStopAtPercentage);

  return Math.ceil(scroll);
};
