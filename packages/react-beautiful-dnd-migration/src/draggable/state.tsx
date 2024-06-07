/**
 * All state for the Draggable in one place.
 *
 * This avoids rerenders (caused by unbatched state updates),
 * but also keeps state logic together.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import type {
	Direction,
	DraggableLocation,
	DragStart,
	DragUpdate,
	DroppableId,
	MovementMode,
} from 'react-beautiful-dnd';

import { isSameLocation } from '../drag-drop-context/draggable-location';
import type { DroppableRegistryEntry } from '../drag-drop-context/droppable-registry';
import { rbdInvariant } from '../drag-drop-context/rbd-invariant';
import { directionMapping } from '../droppable/drop-indicator/constants';
import type { DraggableDimensions } from '../hooks/use-captured-dimensions';
import type { Action } from '../internal-types';

import { keyboardPreviewCrossAxisOffset } from './constants';

type DraggableIdleState = {
	type: 'idle';
	draggingOver: null;
};

export type PointerLocation = {
	initial: {
		input: { clientX: number; clientY: number };
	};
	current: {
		input: { clientX: number; clientY: number };
	};
};

export type DraggablePreviewOffset = {
	x: number;
	y: number;
};

/**
 * The state of a draggable that is currently being dragged.
 * It does not have a clone.
 */
type DraggableDraggingState = {
	type: 'dragging';
	draggingOver: DroppableId | null;
	start: DraggableLocation;
	location: PointerLocation | null;
	draggableId: string;
	mode: MovementMode;
	previewOffset: DraggablePreviewOffset;
};

/**
 * The state of a draggable that is currently hiding,
 * because it its clone is being rendered instead.
 */
type DraggableHidingState = {
	type: 'hiding';
	draggingOver: null;
	mode: MovementMode;
};

export type DraggableState = DraggableIdleState | DraggableDraggingState | DraggableHidingState;

type UpdateKeyboardPayload = {
	update: DragUpdate;
	draggableDimensions: DraggableDimensions | null;
	droppable: DroppableRegistryEntry | null;
	placeholderRect: DOMRect | null;
	dropIndicatorRect: DOMRect | null;
};

export type DraggableAction =
	| Action<'START_POINTER_DRAG', { start: DragStart }>
	| Action<
			'START_KEYBOARD_DRAG',
			{
				start: DragStart;
				draggableDimensions: DraggableDimensions;
				droppable: DroppableRegistryEntry;
			}
	  >
	/**
	 * Updates the drag state.
	 *
	 * This loosely corresponds to an `onDragUpdate` from `react-beautiful-dnd`.
	 */
	| Action<'UPDATE_DRAG', { update: DragUpdate }>
	/**
	 * Updates the preview based on pointer location
	 */
	| Action<'UPDATE_POINTER_PREVIEW', { pointerLocation: PointerLocation }>
	| Action<'UPDATE_KEYBOARD_PREVIEW', UpdateKeyboardPayload>
	| Action<'DROP'>
	/**
	 * These events are specifically for draggables that `shouldRenderCloneWhileDragging`.
	 * They have a distinct hiding state.
	 */
	| Action<'START_HIDING', { mode: MovementMode }>
	| Action<'STOP_HIDING'>;

export const idleState: DraggableIdleState = {
	type: 'idle',
	draggingOver: null,
};

function getHidingState(mode: MovementMode): DraggableHidingState {
	return { type: 'hiding', draggingOver: null, mode };
}

type GetKeyboardPreviewOffsetData = {
	draggableDimensions: DraggableDimensions;
	droppable: DroppableRegistryEntry;
	placeholderRect: DOMRect | null;
	dropIndicatorRect: DOMRect | null;
};

const getKeyboardPreviewOffset = {
	initial({
		direction,
	}: {
		draggableDimensions: DraggableDimensions;
		direction: Direction;
	}): DraggablePreviewOffset {
		/**
		 * The initial offset doesn't use a base offset,
		 * as no scrolling should have ocurred yet.
		 */
		const { mainAxis, crossAxis } = directionMapping[direction];

		return {
			/**
			 * The drag preview should not be offset on the main axis.
			 */
			[mainAxis.name]: 0,
			/**
			 * On the cross axis, the drag preview is offset by a fixed percentage
			 * of its cross axis length.
			 */
			[crossAxis.name]: keyboardPreviewCrossAxisOffset,
		} as DraggablePreviewOffset;
	},
	home({
		droppable: { direction },
		placeholderRect,
		draggableDimensions,
	}: GetKeyboardPreviewOffsetData) {
		rbdInvariant(placeholderRect, 'the placeholder should exist if in home position');

		/**
		 * This base offset will result in the preview being over the placeholder
		 * (same x and y coordinates).
		 *
		 * Consider this as `currentPosition - initialPosition` to find an offset.
		 *
		 * The `placeholderRect` is the **current** viewport-relative position of the
		 * gap where the draggable originated from.
		 *
		 * The `draggableDimensions.rect` is the **initial** viewport-relative position
		 * of the draggable.
		 */
		const baseOffset = {
			x: placeholderRect.x - draggableDimensions.rect.x,
			y: placeholderRect.y - draggableDimensions.rect.y,
		};

		const { mainAxis, crossAxis } = directionMapping[direction];

		return {
			/**
			 * The drag preview should not be visibly offset on the main axis.
			 */
			[mainAxis.name]: baseOffset[mainAxis.name],
			/**
			 * On the cross axis, the drag preview is offset by a fixed percentage
			 * of its cross axis length.
			 *
			 * This is to remain aligned with when it is in the away position.
			 */
			[crossAxis.name]: baseOffset[crossAxis.name] + keyboardPreviewCrossAxisOffset,
		} as DraggablePreviewOffset;
	},
	away({
		droppable: { direction },
		dropIndicatorRect,
		draggableDimensions,
	}: GetKeyboardPreviewOffsetData) {
		rbdInvariant(dropIndicatorRect, 'the drop indicator should exist if in away position');

		/**
		 * This base offset will result in the preview being over the drop indicator
		 * (same x and y coordinates).
		 *
		 * Consider this as `currentPosition - initialPosition` to find an offset.
		 *
		 * The `dropIndicatorRect` is the **current** viewport-relative position of the
		 * drop indicator.
		 *
		 * The `draggableDimensions.rect` is the **initial** viewport-relative position
		 * of the draggable.
		 */
		const baseOffset = {
			x: dropIndicatorRect.x - draggableDimensions.rect.x,
			y: dropIndicatorRect.y - draggableDimensions.rect.y,
		};

		const { mainAxis, crossAxis } = directionMapping[direction];

		return {
			/**
			 * The drop indicator should bisect the preview on its main axis.
			 *
			 * In other words, the drop indicator should be in the middle.
			 */
			[mainAxis.name]:
				baseOffset[mainAxis.name] - 0.5 * draggableDimensions.rect[mainAxis.style.length],
			/**
			 * On the cross axis, the drag preview is offset by a fixed percentage
			 * of its cross axis length.
			 *
			 * This allows some of the drop indicator to remain visible.
			 */
			[crossAxis.name]: baseOffset[crossAxis.name] + keyboardPreviewCrossAxisOffset,
		} as DraggablePreviewOffset;
	},
};

/**
 * Determines the offset for the drag preview for keyboard drags.
 *
 * Unlike mouse drags, during which the drag preview follows the cursor,
 * the drag preview will follow the drop indicator for keyboard drags.
 */
function updateKeyboardPreview(
	state: DraggableDraggingState,
	{
		update,
		droppable,
		draggableDimensions,
		placeholderRect,
		dropIndicatorRect,
	}: UpdateKeyboardPayload,
): DraggableDraggingState {
	if (!droppable || !draggableDimensions) {
		return state;
	}

	const data = {
		droppable,
		draggableDimensions,
		placeholderRect,
		dropIndicatorRect,
	};

	const isHome = isSameLocation(update.source, update.destination ?? null);
	const previewOffset = isHome
		? getKeyboardPreviewOffset.home(data)
		: getKeyboardPreviewOffset.away(data);

	if (!previewOffset) {
		return state;
	}

	return {
		...state,
		previewOffset,
	};
}

function startDrag(
	state: DraggableState,
	{ start, previewOffset }: { start: DragStart; previewOffset: DraggablePreviewOffset },
): DraggableDraggingState {
	rbdInvariant(state.type === 'idle', 'The draggable is idle.');

	const draggingOver = start.source.droppableId;

	const nextState: DraggableDraggingState = {
		type: 'dragging',
		draggingOver,
		location: null,
		start: start.source,
		draggableId: start.draggableId,
		mode: start.mode,
		previewOffset,
	};

	return nextState;
}

export function reducer(state: DraggableState, action: DraggableAction): DraggableState {
	if (action.type === 'START_POINTER_DRAG') {
		return startDrag(state, {
			...action.payload,
			previewOffset: { x: 0, y: 0 },
		});
	}

	if (action.type === 'START_KEYBOARD_DRAG') {
		const { draggableDimensions, droppable } = action.payload;
		return startDrag(state, {
			...action.payload,
			previewOffset: getKeyboardPreviewOffset.initial({
				draggableDimensions,
				direction: droppable.direction,
			}),
		});
	}

	if (action.type === 'UPDATE_DRAG') {
		rbdInvariant(state.type === 'dragging', 'The draggable is dragging.');

		const { update } = action.payload;
		const draggingOver = update.destination ? update.destination.droppableId : null;

		if (draggingOver === state.draggingOver) {
			// Save on an unnecessary rerender
			return state;
		}

		const nextState: DraggableDraggingState = { ...state, draggingOver };
		return nextState;
	}

	if (action.type === 'UPDATE_POINTER_PREVIEW') {
		rbdInvariant(state.type === 'dragging', 'The draggable is dragging.');

		const { pointerLocation } = action.payload;

		const nextState = {
			...state,
			previewOffset: {
				x: pointerLocation.current.input.clientX - pointerLocation.initial.input.clientX,
				y: pointerLocation.current.input.clientY - pointerLocation.initial.input.clientY,
			},
		};

		return nextState;
	}

	if (action.type === 'UPDATE_KEYBOARD_PREVIEW') {
		rbdInvariant(state.type === 'dragging', 'The draggable is dragging.');
		if (state.type !== 'dragging') {
			return state;
		}
		const nextState = updateKeyboardPreview(state, action.payload);
		return nextState;
	}

	if (action.type === 'DROP') {
		rbdInvariant(state.type === 'dragging', 'The draggable is dragging.');

		return idleState;
	}

	if (action.type === 'START_HIDING') {
		rbdInvariant(state.type === 'idle' || state.type === 'hiding');

		return getHidingState(action.payload.mode);
	}

	if (action.type === 'STOP_HIDING') {
		rbdInvariant(state.type === 'hiding');

		return idleState;
	}

	return state;
}
