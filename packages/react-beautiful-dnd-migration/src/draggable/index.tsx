import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { bindAll } from 'bind-event-listener';
import type {
	DraggableProps,
	DraggableProvided,
	DraggableRubric,
	DraggableStateSnapshot,
} from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { getElementFromPointWithoutHoneypot } from '@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot';

import { getHiddenTextElementId } from '../drag-drop-context/hooks/use-hidden-text-element';
import { useDragDropContext } from '../drag-drop-context/internal-context';
import { useMonitorForLifecycle } from '../drag-drop-context/lifecycle-context';
import { rbdInvariant } from '../drag-drop-context/rbd-invariant';
import { useDroppableContext } from '../droppable/droppable-context';
import { useDraggableDimensions } from '../hooks/use-captured-dimensions';
import { useCleanupFn } from '../hooks/use-cleanup-fn';
import { useDropTargetForDraggable } from '../hooks/use-drop-target-for-draggable';
import { useKeyboardContext } from '../hooks/use-keyboard-context';
import { attributes, customAttributes, setAttributes } from '../utils/attributes';
import { findDragHandle } from '../utils/find-drag-handle';
import { findDropIndicator } from '../utils/find-drop-indicator';
import { findPlaceholder } from '../utils/find-placeholder';
import { useStable } from '../utils/use-stable';

import { isDraggableData, useDraggableData } from './data';
import { getDraggableProvidedStyle } from './get-draggable-provided-style';
import isEventInInteractiveElement, {
	isAnInteractiveElement,
} from './is-event-in-interactive-element';
import { Placeholder } from './placeholder';
import { idleState, reducer } from './state';
import { useDraggableStateSnapshot } from './use-draggable-state-snapshot';

const noop = () => {};

export function Draggable({
	children,
	draggableId,
	index,
	isDragDisabled = false,
	disableInteractiveElementBlocking = false,
}: DraggableProps): React.JSX.Element {
	const { direction, droppableId, type, mode } = useDroppableContext();

	const { contextId, getDragState } = useDragDropContext();

	const elementRef = useRef<HTMLElement | null>(null);
	const dragHandleRef = useRef<HTMLElement | null>(null);

	const { setCleanupFn, runCleanupFn } = useCleanupFn();
	const setElement = useCallback(
		(element: HTMLElement | null) => {
			if (elementRef.current) {
				/**
				 * Call the `setAttribute` clean up if the element changes
				 */
				runCleanupFn();
			}

			if (element) {
				/**
				 * The migration layer attaches some additional data attributes.
				 *
				 * These are required for querying elements in the DOM.
				 *
				 * These are not applied through render props, to avoid changing the type
				 * interface of the migration layer.
				 */
				const cleanupFn = setAttributes(element, {
					[customAttributes.draggable.droppableId]: droppableId,
					[customAttributes.draggable.index]: String(index),
				});

				setCleanupFn(cleanupFn);
			}

			elementRef.current = element;
			dragHandleRef.current = findDragHandle({ contextId, draggableId });
		},
		[contextId, draggableId, droppableId, index, runCleanupFn, setCleanupFn],
	);

	const getIndex = useStable(index);

	const [state, dispatch] = useReducer(reducer, idleState);

	const data = useDraggableData({
		draggableId,
		droppableId,
		getIndex,
		contextId,
		type,
	});

	const isDragging = state.type === 'dragging';
	const isHiding = state.type === 'hiding';

	const { shouldRenderCloneWhileDragging, isDropDisabled } = useDroppableContext();

	const monitorForLifecycle = useMonitorForLifecycle();

	const { startKeyboardDrag } = useKeyboardContext();

	/**
	 * Binds the `keydown` listener to the drag handle which handles starting
	 * keyboard drags.
	 */
	useEffect(() => {
		if (state.type !== 'idle') {
			return;
		}

		if (isDragDisabled) {
			return;
		}

		const element = elementRef.current;
		invariant(element instanceof HTMLElement);

		const dragHandle = dragHandleRef.current;
		invariant(dragHandle instanceof HTMLElement);

		return bindAll(dragHandle, [
			{
				type: 'keydown',
				listener(event) {
					if (event.key === ' ') {
						if (event.defaultPrevented) {
							return;
						}

						if (!disableInteractiveElementBlocking && isEventInInteractiveElement(element, event)) {
							return;
						}

						// Only prevent default if we are consuming it
						event.preventDefault();

						startKeyboardDrag({
							event,
							draggableId,
							type,
							getSourceLocation() {
								return { droppableId, index: getIndex() };
							},
							sourceElement: element,
						});
					}
				},
			},
		]);
	}, [
		disableInteractiveElementBlocking,
		draggableId,
		droppableId,
		getIndex,
		isDragDisabled,
		startKeyboardDrag,
		state.type,
		type,
	]);

	/**
	 * Sets up the pdnd draggable.
	 */
	useEffect(() => {
		if (isHiding) {
			/**
			 * If we render a clone, then we need to unmount the original element.
			 *
			 * Because of this, `elementRef.current` will become `null` and we will
			 * no longer have a valid `element` reference.
			 *
			 * In this case, not having a valid `element` is expected,
			 * instead of being an error.
			 */
			return;
		}

		if (isDragDisabled) {
			return;
		}

		const element = elementRef.current;
		rbdInvariant(element instanceof HTMLElement);

		const dragHandle = dragHandleRef.current;
		rbdInvariant(dragHandle instanceof HTMLElement);

		return draggable({
			canDrag({ input }) {
				/**
				 * Do not start a drag if any modifier key is pressed.
				 * This matches the behavior of `react-beautiful-dnd`.
				 */
				if (input.ctrlKey || input.metaKey || input.shiftKey || input.altKey) {
					return false;
				}

				/**
				 * To align with `react-beautiful-dnd` we are blocking drags
				 * on interactive elements, unless the `disableInteractiveElementBlocking`
				 * prop is provided.
				 */
				if (!disableInteractiveElementBlocking) {
					const elementUnderPointer = getElementFromPointWithoutHoneypot({
						x: input.clientX,
						y: input.clientY,
					});
					return !isAnInteractiveElement(dragHandle, elementUnderPointer);
				}

				return !isDragging;
			},
			element,
			dragHandle,
			getInitialData() {
				return data;
			},
			onGenerateDragPreview: disableNativeDragPreview,
		});
	}, [data, disableInteractiveElementBlocking, isDragDisabled, isDragging, isHiding]);

	const hasPlaceholder = state.type !== 'idle' && mode === 'standard';
	const placeholderRef = useRef<HTMLDivElement>(null);

	useDropTargetForDraggable({
		/**
		 * Swapping the drop target to the placeholder is important
		 * to ensure that hovering over where the item was won't result in a
		 * drop at the end of the list.
		 */
		elementRef: hasPlaceholder ? placeholderRef : elementRef,
		data,
		direction,
		contextId,
		isDropDisabled,
		type,
	});

	const isMountedRef = useRef(true);
	useEffect(() => {
		/**
		 * React 18 strict mode will re-run effects in development mode.
		 * https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-re-running-effects-in-development
		 *
		 * Setting the ref value to `true` again in the effect to avoid the value staying `false` incorrectly after
		 * the first cleanup.
		 */
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	/**
	 * If the draggable (re)mounts while it is being dragged (via a clone),
	 * then it should hide itself.
	 */
	useEffect(() => {
		const dragState = getDragState();

		/**
		 * If the draggable is not using a clone, then it doesn't need to be hidden.
		 */
		if (!shouldRenderCloneWhileDragging) {
			return;
		}

		/**
		 * If there is no ongoing drag, then it doesn't need to be hidden.
		 */
		if (!dragState.isDragging) {
			return;
		}

		/**
		 * Only the draggable being dragged (via a clone) needs to be hidden.
		 */
		if (dragState.draggableId !== data.draggableId) {
			return;
		}

		dispatch({ type: 'START_HIDING', payload: { mode: dragState.mode } });
	}, [data.draggableId, getDragState, shouldRenderCloneWhileDragging]);

	const draggableDimensions = useDraggableDimensions();

	useEffect(() => {
		/**
		 * If the draggable should render a clone while dragging,
		 * then it doesn't need to track any state, and it should be hidden.
		 */
		if (shouldRenderCloneWhileDragging) {
			return monitorForLifecycle({
				onPendingDragStart({ start }) {
					if (data.draggableId !== start.draggableId) {
						return;
					}

					dispatch({ type: 'START_HIDING', payload: { mode: start.mode } });
				},
				onBeforeDragEnd({ draggableId }) {
					if (draggableId !== data.draggableId) {
						return;
					}

					dispatch({ type: 'STOP_HIDING' });
				},
			});
		}

		/**
		 * Drag events need to be monitored independently because the original
		 * element can be unmounted for two (valid) reasons.
		 *
		 * The original element can be unmounted during the drag for two reasons:
		 *
		 * 1. A `renderClone` method has been provided to the containing
		 *    `<Droppable />` element. In this case the element is unmounted so
		 *    that it is not visible while the clone is.
		 *
		 * 2. The user portals the element while it is being dragged. This would
		 *    result in the original `HTMLElement` being unmounted.
		 */
		return combine(
			monitorForLifecycle({
				onPendingDragStart({ start, droppable }) {
					if (data.draggableId !== start.draggableId) {
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
					if (data.draggableId !== update.draggableId) {
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
					if (draggableId !== data.draggableId) {
						return;
					}

					rbdInvariant(isMountedRef.current, 'isMounted onBeforeDragEnd');

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

					return (
						source.data.contextId === data.contextId && source.data.draggableId === data.draggableId
					);
				},
				onDrag({ location }) {
					dispatch({
						type: 'UPDATE_POINTER_PREVIEW',
						payload: { pointerLocation: location },
					});
				},
			}),
		);
	}, [
		data.draggableId,
		data.contextId,
		monitorForLifecycle,
		shouldRenderCloneWhileDragging,
		direction,
		contextId,
		draggableDimensions,
		getDragState,
	]);

	const provided: DraggableProvided = useMemo(
		() => ({
			draggableProps: {
				[attributes.draggable.contextId]: contextId,
				[attributes.draggable.id]: draggableId,
				style: getDraggableProvidedStyle({
					draggableDimensions,
					draggableState: state,
				}),
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
				onDragStart: noop,
			},
			innerRef: setElement,
		}),
		[contextId, draggableId, draggableDimensions, state, setElement],
	);

	const snapshot: DraggableStateSnapshot = useDraggableStateSnapshot({
		draggingOver: state.draggingOver,
		isClone: false,
		isDragging,
		mode: isDragging ? state.mode : null,
	});

	const rubric: DraggableRubric = useMemo(
		() => ({
			draggableId,
			type,
			source: {
				droppableId,
				index,
			},
		}),
		[draggableId, droppableId, index, type],
	);

	return (
		<>
			{isHiding ? null : children(provided, snapshot, rubric)}
			{hasPlaceholder && <Placeholder ref={placeholderRef} />}
		</>
	);
}
