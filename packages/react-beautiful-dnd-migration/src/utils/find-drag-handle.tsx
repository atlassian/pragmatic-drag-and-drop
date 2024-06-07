import { attributes } from './attributes';
import { findElement } from './find-element';

/**
 * Obtains the `HTMLElement` with the data attribute passed down through
 * `provided.dragHandleProps`
 */
export function findDragHandle({
	contextId,
	draggableId,
}: {
	contextId: string;
	draggableId: string;
}): HTMLElement | null {
	// Otherwise the drag handle is a descendant.
	return findElement(
		{ attribute: attributes.dragHandle.contextId, value: contextId },
		{ attribute: attributes.dragHandle.draggableId, value: draggableId },
	);
}
