import { attributes, customAttributes } from './attributes';
import { findElementAll } from './find-element';

export function findAllDraggables({
  droppableId,
  contextId,
}: {
  droppableId: string;
  contextId: string;
}): HTMLElement[] {
  return findElementAll(
    { attribute: attributes.draggable.contextId, value: contextId },
    { attribute: customAttributes.draggable.droppableId, value: droppableId },
  );
}
