import type { Axis, Edge, InternalConfig, Side } from '../internal-types';
import { axisLookup } from '../shared/axis';
// Borrowing the hitbox calculation from over-element
// So we can be sure that the 'insideEdge' calculations
// line up perfectly with the 'over element' edge calculations
import { getOverElementHitbox } from '../shared/get-over-element-hitbox';

import { HitboxSpacing } from './types';

function makeGetHitbox({ axis, side }: { axis: Axis; side: Side }) {
  return function hitbox({
    clientRect,
    overflow,
    config,
  }: {
    clientRect: DOMRect;
    overflow: HitboxSpacing;
    config: InternalConfig;
  }): {
    insideOfEdge: DOMRect;
    outsideOfEdge: DOMRect;
  } {
    const { mainAxis, crossAxis } = axisLookup[axis];
    const edge: Edge = mainAxis[side];
    const spacingForEdge = overflow[edge];

    const overElementHitbox = getOverElementHitbox[edge]({
      clientRect,
      config,
    });
    // Same as the over element hitbox,
    // but we are stretching out on the cross axis (if needed)
    const insideOfEdge = DOMRect.fromRect({
      [mainAxis.point]: overElementHitbox[mainAxis.point],
      [mainAxis.size]: overElementHitbox[mainAxis.size],

      // pull the cross axis backwards
      [crossAxis.point]:
        overElementHitbox[crossAxis.point] - spacingForEdge[crossAxis.start],
      // grow the cross axis
      [crossAxis.size]:
        overElementHitbox[crossAxis.size] +
        spacingForEdge[crossAxis.start] +
        spacingForEdge[crossAxis.end],
    });

    // Note: this will be "cut out" by the "overElementHitbox"
    const outsideOfEdge = DOMRect.fromRect({
      [mainAxis.point]:
        side === 'start'
          ? // begin from before the start edge and growing forward
            clientRect[mainAxis.point] - spacingForEdge[mainAxis.start]
          : // begin from on the end edge and go outwards
            clientRect[mainAxis.end],
      [crossAxis.point]:
        clientRect[crossAxis.point] - spacingForEdge[crossAxis.start],
      [mainAxis.size]:
        side === 'start'
          ? spacingForEdge[mainAxis.start]
          : spacingForEdge[mainAxis.end],
      [crossAxis.size]:
        spacingForEdge[crossAxis.start] +
        clientRect[crossAxis.size] +
        spacingForEdge[crossAxis.end],
    });

    return { insideOfEdge, outsideOfEdge };
  };
}

export const getHitbox: {
  [Key in Edge]: (args: {
    clientRect: DOMRect;
    overflow: HitboxSpacing;
    config: InternalConfig;
  }) => {
    insideOfEdge: DOMRect;
    outsideOfEdge: DOMRect;
  };
} = {
  top: makeGetHitbox({
    axis: 'vertical',
    side: 'start',
  }),
  right: makeGetHitbox({
    axis: 'horizontal',
    side: 'end',
  }),
  bottom: makeGetHitbox({
    axis: 'vertical',
    side: 'end',
  }),
  left: makeGetHitbox({
    axis: 'horizontal',
    side: 'start',
  }),
};
