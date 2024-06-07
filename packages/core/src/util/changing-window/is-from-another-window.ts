/**
 * Does the `EventTarget` look like a `Node` based on "duck typing".
 *
 * Helpful when the `Node` might be outside of the current document
 * so we cannot to an `target instanceof Node` check.
 */
function isNodeLike(target: EventTarget): target is Node {
	return 'nodeName' in target;
}

/**
 * Is an `EventTarget` a `Node` from another `window`?
 */
export function isFromAnotherWindow(eventTarget: EventTarget): boolean {
	return isNodeLike(eventTarget) && eventTarget.ownerDocument !== document;
}
