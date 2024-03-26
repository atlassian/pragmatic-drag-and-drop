import type { Axis, Edge, InternalConfig, Side } from '../internal-types';

import { axisLookup } from './axis';
import { mainAxisSideLookup } from './side';

function makeGetHitbox({ edge, axis }: { edge: Edge; axis: Axis }) {
  return function hitbox({
    clientRect,
    config,
  }: {
    clientRect: DOMRect;
    config: InternalConfig;
  }) {
    const { mainAxis, crossAxis } = axisLookup[axis];
    const side: Side = mainAxisSideLookup[edge];

    const mainAxisHitboxSize: number = Math.min(
      // scale the size of the hitbox down for smaller elements
      config.startHitboxAtPercentageRemainingOfElement[edge] *
        clientRect[mainAxis.size],
      // Don't let the hitbox grow too big for big elements
      config.maxMainAxisHitboxSize,
    );

    return DOMRect.fromRect({
      [mainAxis.point]:
        side === 'start'
          ? // begin from the start edge and grow inwards
            clientRect[mainAxis.point]
          : // begin from inside the end edge and grow towards the end edge
            clientRect[mainAxis.point] +
            clientRect[mainAxis.size] -
            mainAxisHitboxSize,
      [crossAxis.point]: clientRect[crossAxis.point],
      [mainAxis.size]: mainAxisHitboxSize,
      [crossAxis.size]: clientRect[crossAxis.size],
    });
  };
}

export const getOverElementHitbox: {
  [Key in Edge]: (args: {
    clientRect: DOMRect;
    config: InternalConfig;
  }) => DOMRect;
} = {
  top: makeGetHitbox({
    axis: 'vertical',
    edge: 'top',
  }),
  right: makeGetHitbox({
    axis: 'horizontal',
    edge: 'right',
  }),
  bottom: makeGetHitbox({
    axis: 'vertical',
    edge: 'bottom',
  }),
  left: makeGetHitbox({
    axis: 'horizontal',
    edge: 'left',
  }),
};
