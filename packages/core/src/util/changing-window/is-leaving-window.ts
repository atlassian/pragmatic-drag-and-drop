import { isSafari } from '../is-safari';

import { isLeavingWindowInSafari } from './count-events-for-safari';

// We cannot do `target instanceof Node` as the `target` might
// be from a different `window`.
// We are doing some "duck typing" here to have a good signal as
function isNodeLike(target: EventTarget): target is Node {
  return 'nodeName' in target;
}

export function isLeavingWindow({
  dragLeave,
}: {
  dragLeave: DragEvent;
}): boolean {
  const { type, relatedTarget } = dragLeave;
  if (type !== 'dragleave') {
    return false;
  }

  if (isSafari()) {
    return isLeavingWindowInSafari({ dragLeave });
  }

  // Standard check: if going to `null` we are leaving the `window`
  if (relatedTarget == null) {
    return true;
  }

  /** 😤 Exceptions (`iframe`s)
   *
   * 🌏 Chrome (`121.0`)
   *
   * Case: parent `window` → child `iframe`
   * `relatedTarget` is the `iframe` in the parent `window`
   *
   * Case: child `iframe` → parent `window`
   * `relatedTarget` is `null` *(standard check)*
   *
   * 🦊 Firefox (`122.0`)
   *
   * Case: parent `window` → child `iframe`
   * `relatedTarget` can be an element _inside_ the child `iframe`
   *
   * Case: child `iframe` → parent `window`
   * `relatedTarget` can be an element _inside_ the parent `window`
   *
   */

  // For Chrome
  // Can use `instanceof` as `iframe` is in the same `window`
  if (relatedTarget instanceof HTMLIFrameElement) {
    return true;
  }

  // For Firefox
  return isNodeLike(relatedTarget) && !document.contains(relatedTarget);
}
