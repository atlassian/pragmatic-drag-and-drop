// eslint-disable-next-line import/no-extraneous-dependencies
import type { DroppableMode } from 'react-beautiful-dnd';

/**
 * Returns the closest element with `position: absolute` or `null` if none found.
 */
function getClosestAbsolutePositionedElement(
  element: HTMLElement,
): HTMLElement | null {
  const { position } = getComputedStyle(element);
  if (position === 'absolute') {
    return element;
  }

  const { parentElement } = element;
  if (parentElement instanceof HTMLElement) {
    return getClosestAbsolutePositionedElement(parentElement);
  }

  return null;
}

/**
 * Returns the closest element that is offset relative to the scroll container.
 */
export function getClosestPositionedElement({
  element,
  mode,
}: {
  element: HTMLElement;
  mode: DroppableMode;
}): HTMLElement {
  /**
   * We use the element directly for standard lists,
   * because we assume it is positioned in the flow.
   */
  if (mode === 'standard') {
    return element;
  }

  /**
   * For virtual lists we use the closest element with `position: absolute`,
   * as this is how virtualization libraries offset elements.
   */
  return getClosestAbsolutePositionedElement(element) ?? element;
}
