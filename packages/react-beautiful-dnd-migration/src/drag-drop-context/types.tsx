import type { DraggableId, DraggableLocation, MovementMode } from 'react-beautiful-dnd';

import type { DraggableDimensions } from '../hooks/use-captured-dimensions';

export type DragState =
	| { isDragging: false }
	| {
			isDragging: true;
			mode: MovementMode;
			draggableDimensions: DraggableDimensions;
			prevDestination: DraggableLocation | null;
			restoreFocusTo: DraggableId | null;

			draggableId: DraggableId;
			type: string;
			sourceLocation: DraggableLocation;
			targetLocation: DraggableLocation | null;

			/**
			 * This is used for positioning placeholders in virtual lists.
			 */
			draggableInitialOffsetInSourceDroppable: { top: number; left: number };
	  };

/**
 * An abstraction that both pointer dragging and keyboard dragging can
 * control state through.
 */
export type DragController = {
	getDragState(): DragState;

	startDrag(args: {
		draggableId: string;
		type: string;
		getSourceLocation(): DraggableLocation;
		sourceElement: HTMLElement;
		mode: MovementMode;
	}): void;

	updateDrag(args: { targetLocation: DraggableLocation | null }): void;

	stopDrag(args: { reason: 'CANCEL' | 'DROP' }): void;
};

export type StartKeyboardDrag = (args: {
	/**
	 * The event that caused `startKeyboardDrag()` to be called.
	 */
	event: KeyboardEvent;
	draggableId: string;
	type: string;
	getSourceLocation(): DraggableLocation;
	sourceElement: HTMLElement;
}) => void;
