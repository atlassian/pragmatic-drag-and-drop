import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import type {
  Axis,
  Edge,
  EngagementHistoryEntry,
  InternalConfig,
} from '../internal-types';
import { canScrollOnEdge } from '../shared/can-scroll-on-edge';
import { edgeAxisLookup, edges } from '../shared/edges';
import { getOverElementHitbox } from '../shared/get-over-element-hitbox';
import { getScrollChange } from '../shared/get-scroll-change';
import { isAxisAllowed } from '../shared/is-axis-allowed';
import { isWithin } from '../shared/is-within';

type ScrollableEdge = {
  edge: Edge;
  hitbox: DOMRect;
};

function getRectDefault(element: Element) {
  return element.getBoundingClientRect();
}

export function getScrollBy({
  element,
  input,
  timeSinceLastFrame,
  engagement,
  config,
  getRect = getRectDefault,
}: {
  element: Element;
  input: Input;
  engagement: EngagementHistoryEntry;
  timeSinceLastFrame: number;
  config: InternalConfig;
  getRect?: (element: Element) => DOMRect;
}): Required<Pick<ScrollToOptions, 'top' | 'left'>> {
  const client: Position = {
    x: input.clientX,
    y: input.clientY,
  };
  const clientRect: DOMRect = getRect(element);
  const { allowedAxis } = config;

  const scrollableEdges: Map<Edge, ScrollableEdge> = edges.reduce(
    (map, edge) => {
      const hitbox = getOverElementHitbox[edge]({ clientRect, config });
      const axis = edgeAxisLookup[edge];

      // Note: changing the allowed axis during a drag will not
      // reset time dampening. It was decided it would be too
      // complex to implement initially, and we can add it
      // later if needed.
      if (!isAxisAllowed(axis, allowedAxis)) {
        return map;
      }

      if (!isWithin({ client, clientRect: hitbox })) {
        return map;
      }
      if (!canScrollOnEdge[edge](element)) {
        return map;
      }

      map.set(edge, { edge, hitbox });
      return map;
    },
    new Map<Edge, ScrollableEdge>(),
  );

  const left: number = (() => {
    const axis: Axis = 'horizontal';
    const leftEdge = scrollableEdges.get('left');
    if (leftEdge) {
      return getScrollChange({
        client,
        edge: leftEdge.edge,
        hitbox: leftEdge.hitbox,
        axis,
        timeSinceLastFrame,
        engagement,
        isDistanceDampeningEnabled: true,
        config,
      });
    }
    const rightEdge = scrollableEdges.get('right');
    if (rightEdge) {
      return getScrollChange({
        client,
        edge: rightEdge.edge,
        hitbox: rightEdge.hitbox,
        axis,
        timeSinceLastFrame,
        engagement,
        isDistanceDampeningEnabled: true,
        config,
      });
    }

    return 0;
  })();

  const top: number = (() => {
    const axis: Axis = 'vertical';
    const bottomEdge = scrollableEdges.get('bottom');
    if (bottomEdge) {
      return getScrollChange({
        client,
        edge: bottomEdge.edge,
        hitbox: bottomEdge.hitbox,
        axis,
        timeSinceLastFrame,
        engagement,
        isDistanceDampeningEnabled: true,
        config,
      });
    }
    const topEdge = scrollableEdges.get('top');
    if (topEdge) {
      return getScrollChange({
        client,
        edge: topEdge.edge,
        hitbox: topEdge.hitbox,
        axis,
        timeSinceLastFrame,
        engagement,
        isDistanceDampeningEnabled: true,
        config,
      });
    }

    return 0;
  })();

  return {
    left,
    top,
  };
}
