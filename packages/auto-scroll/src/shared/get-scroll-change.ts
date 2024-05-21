import { type Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import type {
  Axis,
  Edge,
  EngagementHistoryEntry,
  InternalConfig,
} from '../internal-types';

import { axisLookup } from './axis';
import { getPercentageInRange } from './get-percentage-in-range';
import { mainAxisSideLookup } from './side';

// We want a consistent scroll speed across devices, regardless of framerate
function getMaxScrollChange({
  timeSinceLastFrame,
  config,
}: {
  timeSinceLastFrame: number;
  config: InternalConfig;
}): number {
  const targetScrollPerMs = config.maxPixelScrollPerSecond / 1000;

  // Adjusting out target scroll rate to match the frame rate of the target device
  // This will pull the scroll speed down on high frame rate devices
  // so we get a consistent visual scroll speed regardless of device.
  const proposed = Math.ceil(targetScrollPerMs * timeSinceLastFrame);

  // If lots of time as passed since that last frame (such on lower frame rate devices)
  // we don't want the scroll speed to be too fast, otherwise it can feel jumpy
  // We are capping the scroll speed at what it would be if we were hitting 60fps
  const maximum = config.maxPixelScrollPerSecond / 60;

  return Math.min(proposed, maximum);
}

function getDistanceDampening({
  client,
  axis,
  edge,
  hitbox,
  config,
}: {
  client: Position;
  axis: Axis;
  edge: Edge;
  hitbox: DOMRect;
  config: InternalConfig;
}): number {
  const { mainAxis } = axisLookup[axis];
  const side = mainAxisSideLookup[edge];

  // We want to hit the max speed before the edge of the hitbox
  const maxSpeedBuffer =
    hitbox[mainAxis.size] * config.maxScrollAtPercentageRemainingOfHitbox[edge];

  if (side === 'end') {
    return getPercentageInRange({
      startOfRange: hitbox[mainAxis.start],
      endOfRange: hitbox[mainAxis.end] - maxSpeedBuffer,
      value: client[mainAxis.point],
    });
  }

  // Moving towards start edge

  const raw = getPercentageInRange({
    startOfRange: hitbox[mainAxis.start] + maxSpeedBuffer,
    endOfRange: hitbox[mainAxis.end],
    value: client[mainAxis.point],
  });
  // When moving near start edge
  // - the 'end' edge is where we start scrolling
  // - the 'start' edge is where we reach max speed
  // So we need to invert the percentage when moving backwards
  return 1 - raw;
}

export function getScrollChange({
  client,
  timeSinceLastFrame,
  engagement,
  axis,
  hitbox,
  edge,
  isDistanceDampeningEnabled,
  config,
}: {
  timeSinceLastFrame: number;
  axis: Axis;
  engagement: EngagementHistoryEntry;
  client: Position;
  hitbox: DOMRect;
  edge: Edge;
  isDistanceDampeningEnabled: boolean;
  config: InternalConfig;
}): number {
  // We have two forms of speed dampening:
  // 1. 🗺️ Distance
  // The closer you are to a hitbox edge, the faster the scroll speed will be
  // 2. ⏱️ Time
  // When first entering a scroll container we want to dampening all scrolling
  // This is to prevent super fast auto scrolling when first entering into
  // a scroll container, or when lifting in a scroll container

  const maxScroll = getMaxScrollChange({
    timeSinceLastFrame,
    config,
  });

  const percentageDistanceDampening: number = isDistanceDampeningEnabled
    ? getDistanceDampening({
        client,
        edge,
        hitbox,
        axis,
        config,
      })
    : 1;

  // Dampen speed by time
  const percentageThroughTimeDampening = getPercentageInRange({
    startOfRange: engagement.timeOfEngagementStart,
    endOfRange:
      engagement.timeOfEngagementStart + config.timeDampeningDurationMs,
    value: Date.now(),
  });

  // Calculate how much of the max scroll we should apply based on dampening
  const percentageOfMaxScroll =
    percentageDistanceDampening * percentageThroughTimeDampening;

  // We _could_ ease this update (`Math.pow(percentageOfMaxSpeed, 2)`)
  // But linear is feeling really good
  // Always scrolling by at least one pixel, otherwise the scroll does nothing
  const scroll = Math.max(maxScroll * percentageOfMaxScroll, 1);

  const side = mainAxisSideLookup[edge];

  // When moving backwards, we will be scrolling backwards
  return side === 'end' ? scroll : -1 * scroll;
}
