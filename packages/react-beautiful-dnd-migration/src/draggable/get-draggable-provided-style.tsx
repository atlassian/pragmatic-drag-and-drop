import type { DraggingStyle, NotDraggingStyle } from 'react-beautiful-dnd';

import type { DraggableDimensions } from '../hooks/use-captured-dimensions';

import { zIndex } from './constants';
import type { DraggablePreviewOffset, DraggableState } from './state';

export const notDraggingStyle: NotDraggingStyle = {
	transform: undefined,
	transition: undefined,
};

const baseDraggingStyle = {
	position: 'fixed',
	top: 0,
	left: 0,
	boxSizing: 'border-box',
	transition: 'none',
	zIndex: zIndex.dragging,
	/**
	 * This transparency is intended to allow for better visibility of
	 * drop indicators.
	 */
	opacity: 0.75,
	pointerEvents: 'none',
} as const;

/**
 * Provides the drag preview styles based on the current drag state.
 */
function getDraggingStyle({
	draggableDimensions,
	previewOffset,
}: {
	draggableDimensions: DraggableDimensions;
	previewOffset: DraggablePreviewOffset;
}): DraggingStyle {
	const { rect } = draggableDimensions;

	const translateX = rect.left + previewOffset.x;
	const translateY = rect.top + previewOffset.y;

	const isAtOrigin = translateX === 0 && translateY === 0;

	return {
		...baseDraggingStyle,
		transform: isAtOrigin ? undefined : `translate(${translateX}px, ${translateY}px)`,
		width: rect.width,
		height: rect.height,
	};
}

/**
 * Returns the styles which should be provided to the draggable via the
 * `draggableProps` API.
 */
export function getDraggableProvidedStyle({
	draggableDimensions,
	draggableState,
}: {
	draggableDimensions: DraggableDimensions | null;
	draggableState: DraggableState;
}): DraggingStyle | NotDraggingStyle {
	if (draggableState.type !== 'dragging' || !draggableState.previewOffset || !draggableDimensions) {
		return notDraggingStyle;
	}

	return getDraggingStyle({
		draggableDimensions,
		previewOffset: draggableState.previewOffset,
	});
}
