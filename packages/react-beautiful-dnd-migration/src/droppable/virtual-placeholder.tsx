import React, { type CSSProperties, useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type { Direction, DraggableId, DroppableId } from 'react-beautiful-dnd';

import { useDragDropContext } from '../drag-drop-context/internal-context';
import { rbdInvariant } from '../drag-drop-context/rbd-invariant';
import { useDraggableData } from '../draggable/data';
import { Placeholder } from '../draggable/placeholder';
import { useDropTargetForDraggable } from '../hooks/use-drop-target-for-draggable';

/**
 * The virtual placeholder exists specifically for virtual lists,
 * to ensure that the injected placeholder is correctly positioned.
 *
 * Standard placeholders are rendered as siblings, and do not need explicit
 * positioning.
 *
 * Because virtual placeholders are injected through a portal, they need to be
 * absolutely positioned so that they cover the gap left by the dragging item.
 *
 * This placeholder is important because it acts as the drop target for the
 * dragging item.
 */
export function VirtualPlaceholder({
	draggableId,
	droppableId,
	type,
	direction,
	isDropDisabled,
}: {
	draggableId: DraggableId;
	droppableId: DroppableId;
	type: string;
	direction: Direction;
	isDropDisabled: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const { contextId, getDragState } = useDragDropContext();

	const dragState = getDragState();
	rbdInvariant(
		dragState.isDragging,
		'The virtual placeholder should only be rendered during a drag',
	);

	const getIndex = useCallback(() => {
		return dragState.sourceLocation.index;
	}, [dragState.sourceLocation.index]);

	const data = useDraggableData({
		draggableId,
		droppableId,
		getIndex,
		contextId,
		type,
	});

	/**
	 * This sets up the drop target for the dragging item.
	 */
	useDropTargetForDraggable({
		elementRef: ref,
		data,
		direction,
		contextId,
		isDropDisabled,
		type,
	});

	const style: CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			top: dragState.draggableInitialOffsetInSourceDroppable.top,
			left: dragState.draggableInitialOffsetInSourceDroppable.left,
			margin: 0,
		};
	}, [
		dragState.draggableInitialOffsetInSourceDroppable.left,
		dragState.draggableInitialOffsetInSourceDroppable.top,
	]);

	// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
	return <Placeholder ref={ref} style={style} />;
}
