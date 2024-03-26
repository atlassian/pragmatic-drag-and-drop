import { isSafari } from '../is-safari';

import { isEnteringWindowInSafari } from './count-events-for-safari';

// We cannot do `target instanceof Node` as the `target` might
// be from a different `window`.
// We are doing some "duck typing" here to have a good signal as
function isNodeLike(target: EventTarget): target is Node {
  return 'nodeName' in target;
}

export function isEnteringWindow({
  dragEnter,
}: {
  dragEnter: DragEvent;
}): boolean {
  const { type, relatedTarget } = dragEnter;
  if (type !== 'dragenter') {
    return false;
  }

  if (isSafari()) {
    return isEnteringWindowInSafari({ dragEnter });
  }

  // standard check
  if (relatedTarget == null) {
    return true;
  }

  /**
   * 😤 Special cases (`iframe`)
   *
   *
   * 🌏 Chrome (`121.0`)
   *
   * Case: parent `window` → child `iframe`
   * `relatedTarget` is `null` *(standard check)*
   *
   * Case: child `iframe` → parent `window`
   * `relatedTarget` is the `iframe` element in the parent `window`
   *
   * 🦊 Firefox (122.0)
   *
   * Case: parent `window` → child `iframe`
   *  `relatedTarget` is in the child `iframe` is the `iframe` element
   *  from the parent `window` (when parent is on the same domain)
   *
   * Case: child `iframe` → parent `window`
   * `relatedTarget` is the `iframe` element in the parent `window`
   */

  /**
   * Using `instanceof` check as the element will be in the same `window`
   * Cases: Chrome + Firefox child `iframe` → parent `window`.
   */
  if (relatedTarget instanceof HTMLIFrameElement) {
    return true;
  }

  return isNodeLike(relatedTarget) && !document.contains(relatedTarget);
}
