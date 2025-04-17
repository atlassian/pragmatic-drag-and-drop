import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import type {
	DroppableId,
	DroppableProps,
	DroppableProvided,
	DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { useDragDropContext } from '../drag-drop-context/internal-context';
import { useMonitorForLifecycle } from '../drag-drop-context/lifecycle-context';
import { isDraggableData } from '../draggable/data';
import { useLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { attributes, customAttributes, setAttributes } from '../utils/attributes';
import { useStable } from '../utils/use-stable';

import { useDroppableData } from './data';
import { DraggableClone } from './draggable-clone';
import { DropIndicator } from './drop-indicator';
import {
	type DroppableContextProps,
	DroppableContextProvider,
	useParentDroppableId,
} from './droppable-context';
import { idleState, reducer } from './state';
import { VirtualPlaceholder } from './virtual-placeholder';

export function Droppable({
	children,
	droppableId,
	type = 'DEFAULT', // This default value replicates `react-beautiful-dnd`,
	direction = 'vertical',
	mode = 'standard',
	renderClone,
	getContainerForClone,
	isDropDisabled = false,
}: DroppableProps) {
	const getIsDropDisabled = useStable(isDropDisabled);

	const { contextId, droppableRegistry } = useDragDropContext();

	const data = useDroppableData({
		contextId,
		droppableId,
		getIsDropDisabled,
	});

	const elementRef = useRef<HTMLElement | null>(null);
	const setElement = useCallback(
		(element: HTMLElement | null) => {
			if (element) {
				setAttributes(element, {
					[customAttributes.droppable.type]: type,
					[customAttributes.droppable.direction]: direction,
					/**
					 * We set this manually instead of relying on the provided prop,
					 * because for virtual lists this can be difficult to apply.
					 *
					 * `react-beautiful-dnd` does not actually break if this is not applied.
					 */
					[attributes.droppable.id]: droppableId,
					[attributes.droppable.contextId]: contextId,
				});
			}

			elementRef.current = element;
		},
		[contextId, direction, droppableId, type],
	);

	const [state, dispatch] = useReducer(reducer, idleState);
	const { draggingFromThisWith, draggingOverWith, isDraggingOver } = state;

	const parentDroppableId = useParentDroppableId();

	useEffect(() => {
		const element = elementRef.current;
		invariant(element instanceof HTMLElement, 'innerRef must provide an `HTMLElement`');

		return combine(
			droppableRegistry.register({
				droppableId,
				type,
				isDropDisabled,
				parentDroppableId,
				element,
				direction,
				mode,
			}),
			dropTargetForElements({
				element,
				getData({ input }) {
					return attachClosestEdge(data, {
						element,
						input,
						allowedEdges: direction === 'vertical' ? ['top', 'bottom'] : ['left', 'right'],
					});
				},
				canDrop({ source }) {
					if (!isDraggableData(source.data)) {
						// not dragging something from the migration layer
						// we should not allow dropping
						return false;
					}

					if (isDropDisabled) {
						return false;
					}

					return source.data.contextId === contextId && source.data.type === type;
				},
				onDragLeave() {
					dispatch({ type: 'DRAG_CLEAR' });
				},
			}),
		);
	}, [
		data,
		droppableId,
		contextId,
		isDropDisabled,
		type,
		droppableRegistry,
		parentDroppableId,
		direction,
		mode,
	]);

	const monitorForLifecycle = useMonitorForLifecycle();
	useEffect(() => {
		function isEventRelevant(data: {
			destination: { droppableId: DroppableId } | undefined | null;
			type: string;
		}) {
			/**
			 * If the draggable is of a different type to this droppable,
			 * then we can ignore it.
			 */
			const isSameType = data.type === type;

			const isOverAfterUpdate = data.destination?.droppableId === droppableId;
			const isDragEnter = !isDraggingOver && isOverAfterUpdate;
			const isDragLeave = isDraggingOver && !isOverAfterUpdate;
			/**
			 * A droppable will only have a meaningful state update if the user is entering or exiting it.
			 */
			const isDragEnterOrLeave = isDragEnter || isDragLeave;

			return isSameType && isDragEnterOrLeave;
		}

		return monitorForLifecycle({
			onPendingDragStart({ start }) {
				if (!isEventRelevant({ destination: start.source, type: start.type })) {
					return;
				}

				dispatch({ type: 'DRAG_START', payload: { droppableId, start } });
			},
			onPendingDragUpdate({ update }) {
				if (!isEventRelevant(update)) {
					return;
				}

				dispatch({
					type: 'DRAG_UPDATE',
					payload: { droppableId, update },
				});
			},
			onBeforeDragEnd() {
				/**
				 * This is safe to call optimistically as it uses a stable idle state.
				 *
				 * If the droppable is already idle, it will not rerender.
				 */
				dispatch({ type: 'DRAG_CLEAR' });
			},
		});
	}, [droppableId, isDraggingOver, monitorForLifecycle, type]);

	const dropIndicator = useMemo(() => {
		if (!isDraggingOver) {
			return null;
		}

		return <DropIndicator direction={direction} mode={mode} />;
	}, [direction, isDraggingOver, mode]);

	const provided: DroppableProvided = useMemo(
		() => ({
			innerRef: setElement,
			droppableProps: {
				[attributes.droppable.contextId]: contextId,
				[attributes.droppable.id]: droppableId,
			},
			/**
			 * We only provide a drop indicator as the placeholder for
			 * non-virtual lists. Otherwise it is portalled in.
			 */
			placeholder: mode === 'standard' ? dropIndicator : null,
		}),
		[contextId, dropIndicator, droppableId, mode, setElement],
	);

	const snapshot: DroppableStateSnapshot = useMemo(
		() => ({
			draggingFromThisWith,
			draggingOverWith,
			isDraggingOver,
			isUsingPlaceholder: isDraggingOver,
		}),
		[draggingFromThisWith, draggingOverWith, isDraggingOver],
	);

	const element = elementRef.current;
	const shouldPortalDropIndicator = isDraggingOver && mode === 'virtual' && element;

	/**
	 * Assumes that the ref points to the scroll container.
	 */
	useLayoutEffect(() => {
		if (!shouldPortalDropIndicator) {
			return;
		}

		const { position } = window.getComputedStyle(element);

		if (position !== 'static') {
			return;
		}

		const prevStyle = element.style.position;
		element.style.position = 'relative';

		return () => {
			element.style.position = prevStyle;
		};
	}, [element, shouldPortalDropIndicator]);

	/**
	 * Used to disable the dragging style for the real draggable.
	 */
	const shouldRenderCloneWhileDragging = Boolean(renderClone);

	const contextValue: DroppableContextProps = useMemo(() => {
		return {
			direction,
			droppableId,
			shouldRenderCloneWhileDragging,
			isDropDisabled,
			type,
			mode,
		};
	}, [direction, droppableId, shouldRenderCloneWhileDragging, isDropDisabled, type, mode]);

	/**
	 * For virtual lists we portal a placeholder in when dragging from the list.
	 *
	 * This is because `<Draggable />`'s can be unmounted at any time, so we
	 * cannot rely on rendering the placeholder as a sibling.
	 */
	const shouldPortalPlaceholder = draggingFromThisWith && mode === 'virtual' && element;

	return (
		<DroppableContextProvider value={contextValue}>
			{children(provided, snapshot)}
			{shouldPortalDropIndicator && createPortal(dropIndicator, element)}
			{shouldPortalPlaceholder &&
				createPortal(
					<VirtualPlaceholder
						droppableId={droppableId}
						draggableId={draggingFromThisWith}
						type={type}
						direction={direction}
						isDropDisabled={isDropDisabled}
					/>,
					element,
				)}
			{renderClone && (
				<DraggableClone
					droppableId={droppableId}
					type={type}
					getContainerForClone={getContainerForClone}
				>
					{renderClone}
				</DraggableClone>
			)}
		</DroppableContextProvider>
	);
}
