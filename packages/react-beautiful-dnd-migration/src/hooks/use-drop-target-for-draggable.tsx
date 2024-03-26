import { RefObject, useEffect } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type { Direction } from 'react-beautiful-dnd';

import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { rbdInvariant } from '../drag-drop-context/rbd-invariant';
import { DraggableData, isDraggableData } from '../draggable/data';

export function useDropTargetForDraggable({
  elementRef,
  data,
  direction,
  contextId,
  isDropDisabled,
  type,
}: {
  elementRef: RefObject<HTMLElement>;
  data: DraggableData;
  direction: Direction;
  contextId: string;
  isDropDisabled: boolean;
  type: string;
}) {
  useEffect(() => {
    const element = elementRef.current;
    rbdInvariant(element instanceof HTMLElement);

    return dropTargetForElements({
      element,
      getIsSticky() {
        return true;
      },
      canDrop({ source }) {
        if (!isDraggableData(source.data)) {
          // not dragging something from the migration layer
          // we should not allow dropping
          return false;
        }

        if (isDropDisabled) {
          return false;
        }

        return source.data.type === type && source.data.contextId === contextId;
      },
      getData({ input }) {
        return attachClosestEdge(data, {
          element,
          input,
          allowedEdges:
            direction === 'vertical' ? ['top', 'bottom'] : ['left', 'right'],
        });
      },
    });
  }, [data, direction, contextId, isDropDisabled, type, elementRef]);
}
