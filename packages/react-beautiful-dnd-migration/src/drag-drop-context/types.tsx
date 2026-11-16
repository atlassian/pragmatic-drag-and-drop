import type { ReactNode } from 'react';

import type {
	DraggableId,
	DraggableLocation,
	DragDropContextProps as RbdDragDropContextProps,
	MovementMode,
} from 'react-beautiful-dnd';

import type { DraggableDimensions } from '../hooks/use-captured-dimensions';

/** The token roles used to color the adapter's drop indicators. */
export type Colors = 'standard' | 'dedicated';

export type DragDropContextProps = RbdDragDropContextProps & {
	children?: ReactNode;
	/**
	 * Token roles for all drop indicators in this context. Defaults to `standard`,
	 * preserving existing colors. Use `dedicated` to opt into drag and drop tokens.
	 */
	colors?: Colors;
};

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
