import React, { useCallback, useEffect, useMemo, useReducer } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type {
	DraggableChildrenFn,
	DraggableProvided,
	DraggableRubric,
	DraggableStateSnapshot,
	DraggingStyle,
	DroppableId,
	MovementMode,
	NotDraggingStyle,
} from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { getHiddenTextElementId } from '../drag-drop-context/hooks/use-hidden-text-element';
import { useDragDropContext } from '../drag-drop-context/internal-context';
import { useMonitorForLifecycle } from '../drag-drop-context/lifecycle-context';
import { rbdInvariant } from '../drag-drop-context/rbd-invariant';
import { isDraggableData } from '../draggable/data';
import { getDraggableProvidedStyle } from '../draggable/get-draggable-provided-style';
import { idleState, reducer } from '../draggable/state';
import { useDraggableStateSnapshot } from '../draggable/use-draggable-state-snapshot';
import { useDraggableDimensions } from '../hooks/use-captured-dimensions';
import { attributes } from '../utils/attributes';
import { findDragHandle } from '../utils/find-drag-handle';
import { findDropIndicator } from '../utils/find-drop-indicator';
import { findPlaceholder } from '../utils/find-placeholder';

function getBody() {
	return document.body;
}

/**
 * Calls the `renderClone` function.
 *
 * Only rendered during drags.
 */
function DraggableCloneInner({
	children,
	droppableId,
	type,
	draggableId,
	index,
	draggingOver,
	style,
	/**
	 * Defaults to `document.body`
	 */
	getContainerForClone = getBody,
	mode,
}: {
	children: DraggableChildrenFn;
	droppableId: DroppableId;
	type: string;
	draggableId: string;
	index: number;
	draggingOver: DroppableId | null;
	style: DraggingStyle | NotDraggingStyle;
	getContainerForClone?: () => HTMLElement;
	mode: MovementMode;
}) {
	const { contextId } = useDragDropContext();

	/**
	 * The handle should maintain focus during a drag,
	 * if it had focus before the drag started.
	 */
	const focusDragHandle = useCallback(
		(element: HTMLElement | null) => {
			if (!element) {
				return;
			}

			const dragHandle = findDragHandle({ contextId, draggableId });
			dragHandle?.focus();
		},
		[contextId, draggableId],
	);

	const provided: DraggableProvided = useMemo(() => {
		return {
			innerRef: focusDragHandle,
			draggableProps: {
				[attributes.draggable.contextId]: contextId,
				[attributes.draggable.id]: draggableId,
				style,
			},
			dragHandleProps: {
				role: 'button',
				'aria-describedby': getHiddenTextElementId(contextId),
				[attributes.dragHandle.contextId]: contextId,
				[attributes.dragHandle.draggableId]: draggableId,
				tabIndex: 0,
				/**
				 * This must be `false` for drags to trigger on the draggable `element`,
				 * which may be a parent, and not on the `dragHandle`.
				 *
				 * If the drag triggers on the `dragHandle` it won't be handled by the
				 * library.
				 */
				draggable: false,
				onDragStart: () => {},
			},
		};
	}, [contextId, draggableId, focusDragHandle, style]);

	const snapshot: DraggableStateSnapshot = useDraggableStateSnapshot({
		draggingOver,
		isClone: true,
		isDragging: true,
		mode,
	});

	const rubric: DraggableRubric = useMemo(() => {
		return {
			draggableId,
			type,
			source: {
				droppableId,
				index,
			},
		};
	}, [draggableId, droppableId, index, type]);

	return createPortal(children(provided, snapshot, rubric), getContainerForClone());
}

/**
 * Wrapper that is always rendered if there is a `renderClone` function.
 *
 * It sets up a monitor, and needs to observe the entire lifecycle.
 */
export function DraggableClone({
	children,
	droppableId,
	type,
	getContainerForClone,
}: {
	children: DraggableChildrenFn;
	droppableId: DroppableId;
	type: string;
	getContainerForClone?: () => HTMLElement;
}) {
	const { contextId, getDragState } = useDragDropContext();

	const draggableDimensions = useDraggableDimensions();

	const [state, dispatch] = useReducer(reducer, idleState);

	const monitorForLifecycle = useMonitorForLifecycle();

	useEffect(() => {
		return combine(
			monitorForLifecycle({
				onPendingDragStart({ start, droppable }) {
					if (droppableId !== start.source.droppableId) {
						return;
					}

					if (start.mode === 'FLUID') {
						return dispatch({
							type: 'START_POINTER_DRAG',
							payload: { start },
						});
					}

					if (start.mode === 'SNAP') {
						const dragState = getDragState();
						rbdInvariant(dragState.isDragging && dragState.draggableDimensions);
						return dispatch({
							type: 'START_KEYBOARD_DRAG',
							payload: {
								start,
								draggableDimensions: dragState.draggableDimensions,
								droppable,
							},
						});
					}
				},
				onPendingDragUpdate({ update, droppable }) {
					if (state.type !== 'dragging') {
						return;
					}

					if (state.draggableId !== update.draggableId) {
						return;
					}

					dispatch({
						type: 'UPDATE_DRAG',
						payload: { update },
					});

					if (update.mode === 'SNAP') {
						/**
						 * Updating the position in a microtask to resolve timing issues.
						 *
						 * When doing cross-axis dragging, the drop indicator in the new
						 * droppable will mount and update in a `onPendingDragUpdate` too.
						 *
						 * The microtask ensures that the indicator will have updated by
						 * the time this runs, so the preview will have the correct
						 * location of the indicator.
						 */
						queueMicrotask(() => {
							/**
							 * Because this update occurs in a microtask, we need to check
							 * that the drag is still happening.
							 *
							 * If it has ended we should not try to update the preview.
							 */
							const dragState = getDragState();
							if (!dragState.isDragging) {
								return;
							}

							/**
							 * The placeholder might not exist if its associated
							 * draggable unmounts in a virtual list.
							 */
							const placeholder = findPlaceholder(contextId);
							const placeholderRect = placeholder ? placeholder.getBoundingClientRect() : null;

							/**
							 * The drop indicator might not exist if the current target
							 * is null
							 */
							const dropIndicator = findDropIndicator();
							const dropIndicatorRect = dropIndicator
								? dropIndicator.getBoundingClientRect()
								: null;

							dispatch({
								type: 'UPDATE_KEYBOARD_PREVIEW',
								payload: {
									update,
									draggableDimensions,
									droppable,
									placeholderRect,
									dropIndicatorRect,
								},
							});
						});
					}
				},
				onBeforeDragEnd({ draggableId }) {
					if (state.type !== 'dragging') {
						return;
					}

					if (draggableId !== state.draggableId) {
						return;
					}

					dispatch({ type: 'DROP' });
				},
			}),
			monitorForElements({
				canMonitor({ source }) {
					if (!isDraggableData(source.data)) {
						// not dragging something from the migration layer
						// we should not monitor it
						return false;
					}

					return source.data.contextId === contextId && source.data.droppableId === droppableId;
				},
				onDrag({ location }) {
					dispatch({
						type: 'UPDATE_POINTER_PREVIEW',
						payload: { pointerLocation: location },
					});
				},
			}),
		);
	}, [droppableId, contextId, monitorForLifecycle, state, draggableDimensions, getDragState]);

	if (state.type !== 'dragging') {
		return null;
	}

	const style = getDraggableProvidedStyle({
		draggableDimensions,
		draggableState: state,
	});

	return (
		<DraggableCloneInner
			droppableId={droppableId}
			type={type}
			draggableId={state.draggableId}
			index={state.start.index}
			draggingOver={state.draggingOver}
			mode={state.mode}
			// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
			style={style}
			getContainerForClone={getContainerForClone}
		>
			{children}
		</DraggableCloneInner>
	);
}
