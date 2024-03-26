import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { getReorderDestinationIndex } from './get-reorder-destination-index';
import type { Edge } from './types';

export function reorderWithEdge<Value>({
  list,
  startIndex,
  closestEdgeOfTarget,
  indexOfTarget,
  axis,
}: {
  list: Value[];
  closestEdgeOfTarget: Edge | null;
  startIndex: number;
  indexOfTarget: number;
  axis: 'vertical' | 'horizontal';
}): Value[] {
  return reorder({
    list,
    startIndex,
    finishIndex: getReorderDestinationIndex({
      closestEdgeOfTarget,
      startIndex,
      indexOfTarget,
      axis,
    }),
  });
}
