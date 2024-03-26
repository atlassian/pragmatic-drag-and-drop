// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  Direction,
  DraggableLocation,
  DroppableId,
  DroppableMode,
} from 'react-beautiful-dnd';

import { attributes } from '../../utils/attributes';
import { findClosestScrollContainer } from '../../utils/find-closest-scroll-container';
import { getElement } from '../../utils/find-element';
import { findPlaceholder } from '../../utils/find-placeholder';
import { getClosestPositionedElement } from '../../utils/get-closest-positioned-element';
import { getElementByDraggableLocation } from '../../utils/get-element-by-draggable-location';
import { getGapOffset } from '../gap';

import { directionMapping, lineOffset } from './constants';
import type { IndicatorSizeAndOffset } from './types';

/**
 * Returns the dimensions for a drop indicator either before or after a
 * draggable.
 *
 * `isForwardEdge` determines whether it is before or after.
 */
function measureDraggable({
  element,
  isForwardEdge,
  mode,
  direction,
  contextId,
}: {
  element: HTMLElement;
  isForwardEdge: boolean;
  mode: DroppableMode;
  direction: Direction;
  contextId: string;
}) {
  const { mainAxis, crossAxis } = directionMapping[direction];

  const offsetElement = getClosestPositionedElement({ element, mode });

  const gapOffset = getGapOffset({
    element,
    where: isForwardEdge ? 'after' : 'before',
    direction,
    contextId,
  });

  const baseOffset = offsetElement[mainAxis.offset] - lineOffset;
  const mainAxisOffset = isForwardEdge
    ? baseOffset + element[mainAxis.length]
    : baseOffset;

  return {
    mainAxis: {
      offset: mainAxisOffset + gapOffset,
    },
    crossAxis: {
      offset: offsetElement[crossAxis.offset],
      length: offsetElement[crossAxis.length],
    },
  };
}

/**
 * This will return an indicator size and offset corresponding to a line
 * through the middle of the placeholder.
 *
 * The reason this is a special case, instead of just falling back to the
 * standard positioning logic, is to avoid measuring the drag preview.
 */
function measurePlaceholder({
  element,
  direction,
}: {
  element: HTMLElement;
  direction: Direction;
}) {
  const { mainAxis, crossAxis } = directionMapping[direction];

  /**
   * This function measures against the `element` directly instead of an
   * `offsetElement` because:
   * - For standard lists, that is already the behavior.
   * - For virtual lists, we know that the `element` is being absolutely
   *   positioned (and not an ancestor).
   */
  const baseOffset = element[mainAxis.offset] - lineOffset;
  const mainAxisOffset = baseOffset + element[mainAxis.length] / 2;

  return {
    mainAxis: {
      offset: mainAxisOffset,
    },
    crossAxis: {
      offset: element[crossAxis.offset],
      length: element[crossAxis.length],
    },
  };
}

function getDroppableOffset({
  element,
  direction,
}: {
  element: HTMLElement;
  direction: Direction;
}) {
  const { mainAxis } = directionMapping[direction];

  const scrollContainer = findClosestScrollContainer(element);
  if (!scrollContainer) {
    return 0;
  }

  /**
   * If the scroll container has static positioning,
   * then we need to add the scroll container's offset as well.
   */
  const { position } = getComputedStyle(scrollContainer);
  if (position !== 'static') {
    return 0;
  }

  return scrollContainer[mainAxis.offset];
}

/**
 * Returns the dimensions for a drop indicator in an empty list.
 */
function measureDroppable({
  droppableId,
  direction,
}: {
  droppableId: DroppableId;
  direction: Direction;
}) {
  const element = getElement({
    attribute: attributes.droppable.id,
    value: droppableId,
  });
  const mainAxisOffset = getDroppableOffset({ element, direction });

  return {
    mainAxis: {
      offset: mainAxisOffset,
    },
    crossAxis: {
      offset: 0,
      length: '100%',
    },
  };
}

export function getIndicatorSizeAndOffset({
  targetLocation,
  isInHomeLocation,
  direction,
  mode,
  contextId,
}: {
  targetLocation: DraggableLocation;
  isInHomeLocation: boolean;
  direction: Direction;
  mode: DroppableMode;
  contextId: string;
}): IndicatorSizeAndOffset | null {
  if (isInHomeLocation) {
    /**
     * If we are in the home location (source === destination) then the
     * indicator is centered in the placeholder.
     *
     * It isn't visible, but is used to scroll to.
     *
     * This is a special case, because the standard logic will not work
     * correctly when measuring the drag preview,
     * which occurs when in the home location.
     *
     * This is because the drag preview:
     *
     * 1. Has `position: fixed; top: 0; left: 0;` so its `offsetTop` and `offsetLeft`
     *    will always be `0`, which result in the indicator being at the start of the list.
     * 2. Is in the wrong location anyway.
     *
     * `measurePlaceholder()` is specifically designed for this case.
     */

    const element = findPlaceholder(contextId);
    if (!element) {
      return null;
    }

    return measurePlaceholder({ element, direction });
  }

  if (targetLocation.index === 0) {
    /**
     * If the target is the 0th index, there are two situations:
     *
     * 1. Targeting an empty list
     * 2. Targeting before the first item in the list
     */

    const element = getElementByDraggableLocation(contextId, targetLocation);
    if (!element) {
      /**
       * If there's no element in the location, it is because the list is empty.
       * In this case, we measure the droppable itself to draw the indicator.
       */
      return measureDroppable({
        droppableId: targetLocation.droppableId,
        direction,
      });
    }

    /**
     * Otherwise, there is a reference element we can use to measure.
     */
    return measureDraggable({
      element,
      // `false` because the line is before the item
      isForwardEdge: false,
      mode,
      direction,
      contextId,
    });
  }

  /**
   * Otherwise, for any other index, we can measure the draggable above where
   * we would be dropping.
   */

  const element = getElementByDraggableLocation(contextId, {
    droppableId: targetLocation.droppableId,
    // subtracting one because it is the draggable above
    index: targetLocation.index - 1,
  });

  if (!element) {
    return null;
  }

  return measureDraggable({
    element,
    // `true` because the line is after the item
    isForwardEdge: true,
    mode,
    direction,
    contextId,
  });
}
