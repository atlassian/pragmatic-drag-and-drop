import { RefObject, useEffect, useState } from 'react';

import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';

type ShouldHideDropIndicatorArgs = {
  closestEdge: Edge | null;
  sourceIndex: number;
  targetIndex: number;
};

type UseSortableFieldArgs = {
  id: string;
  index: number;
  type: string;
  ref: RefObject<HTMLElement>;

  shouldHideNativeDragPreview?: boolean;

  /**
   * Used for the Asana clone.
   */
  shouldHideDropIndicatorForNoopTargets?: boolean;
  isSticky?: boolean;
  onGenerateDragPreview?: (args: {
    nativeSetDragImage: (image: Element, x: number, y: number) => void;
  }) => void;

  /**
   * Used for Notion clone
   */
  dragHandle?: HTMLElement | null;
  customShouldHideDropIndicator?: (
    args: ShouldHideDropIndicatorArgs,
  ) => boolean;
};

function shouldHideDropIndicator({
  closestEdge,
  sourceIndex,
  targetIndex,
}: ShouldHideDropIndicatorArgs) {
  const isTargetingSelf = sourceIndex === targetIndex;
  const isTargetingBottomOfPrevious =
    closestEdge === 'bottom' && targetIndex === sourceIndex - 1;
  const isTargetingTopOfNext =
    closestEdge === 'top' && targetIndex === sourceIndex + 1;

  return isTargetingSelf || isTargetingBottomOfPrevious || isTargetingTopOfNext;
}

export type DragState = 'idle' | 'preview' | 'dragging';

export function useSortableField({
  id,
  index,
  type,
  ref,
  shouldHideNativeDragPreview = false,
  shouldHideDropIndicatorForNoopTargets = true,
  isSticky = true,
  onGenerateDragPreview,
  dragHandle = null,
  customShouldHideDropIndicator,
}: UseSortableFieldArgs) {
  const [isHovering, setIsHovering] = useState(false);
  const [dragState, setDragState] = useState<DragState>('idle');
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const isDragging = dragState !== 'idle';

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const data = { id, index, type };

    return combine(
      bindAll(element, [
        {
          type: 'pointerenter',
          listener() {
            setIsHovering(true);
          },
        },
        {
          type: 'pointerleave',
          listener() {
            setIsHovering(false);
          },
        },
      ]),
      draggable({
        element,
        dragHandle: dragHandle ?? undefined,
        getInitialData() {
          return data;
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          if (shouldHideNativeDragPreview) {
            disableNativeDragPreview({ nativeSetDragImage });
          }
          setDragState('preview');

          if (onGenerateDragPreview && nativeSetDragImage) {
            onGenerateDragPreview({ nativeSetDragImage });
          }
        },
        onDragStart() {
          setDragState('dragging');
        },
        onDrop() {
          setDragState('idle');
        },
      }),
      dropTargetForElements({
        element,
        getIsSticky() {
          return isSticky;
        },
        canDrop({ source }) {
          return source.data.type === type;
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDrag({ self, source }) {
          const closestEdge = extractClosestEdge(self.data);
          const sourceIndex = source.data.index;
          invariant(typeof sourceIndex === 'number');

          if (
            !shouldHideDropIndicatorForNoopTargets &&
            customShouldHideDropIndicator
          ) {
            const shouldHide = customShouldHideDropIndicator({
              closestEdge,
              sourceIndex,
              targetIndex: index,
            });

            setClosestEdge(shouldHide ? null : closestEdge);
            return;
          }

          if (
            shouldHideDropIndicatorForNoopTargets &&
            shouldHideDropIndicator({
              closestEdge,
              sourceIndex,
              targetIndex: index,
            })
          ) {
            setClosestEdge(null);
          } else {
            setClosestEdge(closestEdge);
          }
        },
        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop() {
          setClosestEdge(null);
        },
      }),
    );
  }, [
    customShouldHideDropIndicator,
    dragHandle,
    id,
    index,
    isSticky,
    onGenerateDragPreview,
    ref,
    shouldHideDropIndicatorForNoopTargets,
    shouldHideNativeDragPreview,
    type,
  ]);

  return { isHovering, isDragging, dragState, closestEdge };
}
