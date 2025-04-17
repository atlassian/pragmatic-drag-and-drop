import type { DraggableLocation } from 'react-beautiful-dnd';

import { attributes, customAttributes } from './attributes';
import { findElement } from './find-element';

export function getElementByDraggableLocation(
	contextId: string,
	location: DraggableLocation | null,
): HTMLElement | null {
	if (!location) {
		return null;
	}

	return findElement(
		{ attribute: attributes.draggable.contextId, value: contextId },
		{
			attribute: customAttributes.draggable.droppableId,
			value: location.droppableId,
		},
		{
			attribute: customAttributes.draggable.index,
			value: String(location.index),
		},
	);
}
