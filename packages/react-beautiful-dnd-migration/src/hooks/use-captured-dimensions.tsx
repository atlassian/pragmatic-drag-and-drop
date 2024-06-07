import { useDragDropContext } from '../drag-drop-context/internal-context';

export type DraggableDimensions = {
	rect: DOMRect;
	margin: string;
};

export function getDraggableDimensions(element: HTMLElement): DraggableDimensions {
	const { margin } = window.getComputedStyle(element);
	const rect = element.getBoundingClientRect();
	return { margin, rect };
}

/**
 * Returns the captured dimensions of the item being dragged.
 */
export function useDraggableDimensions(): DraggableDimensions | null {
	const { getDragState } = useDragDropContext();
	const dragState = getDragState();
	if (!dragState.isDragging) {
		return null;
	}
	return dragState.draggableDimensions;
}
