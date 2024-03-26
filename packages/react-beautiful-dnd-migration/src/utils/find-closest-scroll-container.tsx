/**
 * Ported from `react-beautiful-dnd`
 */
export function findClosestScrollContainer(
  element: HTMLElement,
): HTMLElement | null {
  const { overflowX, overflowY } = getComputedStyle(element);

  if (
    overflowX === 'scroll' ||
    overflowX === 'auto' ||
    overflowY === 'scroll' ||
    overflowY === 'auto'
  ) {
    return element;
  }

  const { parentElement } = element;

  if (parentElement === null) {
    return null;
  }

  return findClosestScrollContainer(parentElement);
}
