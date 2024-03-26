// eslint-disable-next-line import/no-extraneous-dependencies
import type { DraggableLocation } from 'react-beautiful-dnd';

import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { DragLocation } from '@atlaskit/pragmatic-drag-and-drop/types';

import { DraggableData, isDraggableData } from '../draggable/data';
import { DroppableData, isDroppableData } from '../droppable/data';
import { customAttributes, getAttribute } from '../utils/attributes';
import { findAllDraggables } from '../utils/find-all-draggables';

/**
 * Derives the `DraggableLocation` of a `<Draggable>`.
 *
 * Accounts for which edge is being hovered over.
 */
function getDraggableLocationFromDraggableData({
  droppableId,
  getIndex,
  ...data
}: DraggableData): DraggableLocation | null {
  /**
   * The index that the draggable is currently occupying.
   */
  let index = getIndex();
  const closestEdge = extractClosestEdge(
    /**
     * TypeScript doesn't like this without casting.
     *
     * The IDE doesn't have an issue, but if you try to build it then
     * there will be an error.
     */
    data as unknown as Record<string | symbol, unknown>,
  );
  /**
   * Whether the user is hovering over the second half of the draggable.
   *
   * For a vertical list it is the bottom half,
   * while for a horizontal list it is the right half.
   */
  const isForwardEdge = closestEdge === 'bottom' || closestEdge === 'right';
  if (isForwardEdge) {
    /**
     * If hovering over the 'forward' half of the draggable,
     * then the user is targeting the index after the draggable.
     */
    index += 1;
  }

  return { droppableId, index };
}

/**
 * Derives the `DraggableLocation` of a `<Droppable>`.
 *
 * This corresponds to the first or last index of the list,
 * depending on where the user is hovering.
 */
function getDraggableLocationFromDroppableData({
  contextId,
  droppableId,
  ...data
}: DroppableData): DraggableLocation | null {
  const draggables = findAllDraggables({ contextId, droppableId });

  /**
   * If there are no draggables, then the index should be 0
   */
  if (draggables.length === 0) {
    return { droppableId, index: 0 };
  }

  const closestEdge = extractClosestEdge(data);
  /**
   * Whether the user is closer to the start of the droppable.
   *
   * For a vertical list it is the top half,
   * while for a horizontal list it is the left half.
   */
  const isCloserToStart = closestEdge === 'top' || closestEdge === 'left';
  if (isCloserToStart) {
    /**
     * If the user is closer to the start of the list, we will target the
     * first (0th) index.
     */
    return { droppableId, index: 0 };
  }

  /**
   * We don't just take the index of the last draggable,
   * because portal-ing can lead to the DOM order not matching indexes.
   */
  const biggestIndex = draggables.reduce((max, draggable) => {
    const draggableIndex = parseInt(
      getAttribute(draggable, customAttributes.draggable.index),
      10,
    );
    return Math.max(max, draggableIndex);
  }, 0);

  return { droppableId, index: biggestIndex + 1 };
}

/**
 * Derives a `DraggableLocation` (`react-beautiful-dnd`)
 * from a `DragLocation` (`@atlaskit/pragmatic-drag-and-drop`).
 */
export function getDraggableLocation(
  location: DragLocation,
): DraggableLocation | null {
  const { dropTargets } = location;

  // If there are no drop targets then there is no destination.
  if (dropTargets.length === 0) {
    return null;
  }

  // Obtains the innermost drop target.
  const target = dropTargets[0];

  // If the target is a draggable we can extract its index.
  if (isDraggableData(target.data)) {
    return getDraggableLocationFromDraggableData(target.data);
  }

  // If the target is a droppable, there is no index to extract.
  // We default to the end of the droppable.
  if (isDroppableData(target.data)) {
    return getDraggableLocationFromDroppableData(target.data);
  }

  // The target is not from the migration layer.
  return null;
}

/**
 * Checks if two `DraggableLocation` values are equivalent.
 */
export function isSameLocation(
  a: DraggableLocation | null,
  b: DraggableLocation | null,
) {
  if (a?.droppableId !== b?.droppableId) {
    return false;
  }

  if (a?.index !== b?.index) {
    return false;
  }

  return true;
}
