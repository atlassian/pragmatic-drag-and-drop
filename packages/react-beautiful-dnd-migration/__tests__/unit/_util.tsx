import type { DroppableId } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import { attributes, customAttributes } from '../../src/utils/attributes';

export function setElementFromPoint(el: Element | null): CleanupFn {
  const original = document.elementFromPoint;

  document.elementFromPoint = () => el;

  return () => {
    document.elementFromPoint = original;
  };
}

export function getDroppable(
  droppableId: DroppableId,
  container: HTMLElement,
): HTMLElement {
  const droppable = container.querySelector(
    `[${attributes.droppable.id}="${droppableId}"]`,
  );
  invariant(
    droppable instanceof HTMLElement,
    `Could not find droppable ${droppableId}`,
  );
  return droppable;
}

export function findPlaceholderInDroppable(
  droppableId: DroppableId,
  container: HTMLElement,
): HTMLElement | null {
  const droppable = getDroppable(droppableId, container);
  return droppable.querySelector(`[${attributes.placeholder.contextId}]`);
}

export function getPlaceholder(): HTMLElement {
  const placeholder = document.body.querySelector(
    `[${attributes.placeholder.contextId}]`,
  );
  invariant(placeholder instanceof HTMLElement);
  return placeholder;
}

export function hasPlaceholderInDroppable(
  droppableId: DroppableId,
  container: HTMLElement,
): boolean {
  return Boolean(findPlaceholderInDroppable(droppableId, container));
}

export function findDropIndicator(
  droppableId: DroppableId,
  container: HTMLElement,
): HTMLElement | null {
  return container.querySelector(
    `[${attributes.droppable.id}="${droppableId}"] [${customAttributes.dropIndicator}]`,
  );
}

export function hasDropIndicator(
  droppableId: DroppableId,
  container: HTMLElement,
): boolean {
  return Boolean(findDropIndicator(droppableId, container));
}
