import { useCallback, useEffect } from 'react';

import { autoScroller } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';

import { isDraggableData } from '../../draggable/data';
import { isDroppableData } from '../../droppable/data';
import { getDraggableLocation } from '../draggable-location';
import { rbdInvariant } from '../rbd-invariant';
import type { DragController } from '../types';

/**
 * Sets up listeners for pointer dragging.
 */
export function usePointerControls({
	dragController,
	contextId,
}: {
	dragController: DragController;
	contextId: string;
}) {
	const updatePointerDrag = useCallback(
		(location: DragLocationHistory) => {
			dragController.updateDrag({
				targetLocation: getDraggableLocation(location.current),
			});
		},
		[dragController],
	);

	useEffect(() => {
		return monitorForElements({
			canMonitor({ initial, source }) {
				if (!isDraggableData(source.data)) {
					// not dragging something from the migration layer
					// we should not monitor it
					return false;
				}

				const isValidDraggable = source.data.contextId === contextId;
				if (!isValidDraggable) {
					return false;
				}

				const droppable = initial.dropTargets.find((target) => isDroppableData(target.data));

				if (!droppable) {
					/**
					 * There may be no droppable in the `dropTargets` if it is disabled.
					 *
					 * This is still valid.
					 */
					return true;
				}

				const isValidDroppable = droppable.data.contextId === contextId;
				return isValidDroppable;
			},

			onDragStart({ location, source }) {
				autoScroller.start({ input: location.current.input });

				/**
				 * We use `preventUnhandled` because we are rendering a custom drag
				 * preview.
				 */
				preventUnhandled.start();

				const { data } = source;
				rbdInvariant(isDraggableData(data));
				const { draggableId, droppableId, getIndex, type } = data;

				dragController.startDrag({
					draggableId,
					type,
					getSourceLocation() {
						return {
							droppableId,
							index: getIndex(),
						};
					},
					sourceElement: source.element,
					mode: 'FLUID',
				});
			},

			onDrag({ location }) {
				autoScroller.updateInput({ input: location.current.input });
				updatePointerDrag(location);
			},

			onDropTargetChange({ location }) {
				updatePointerDrag(location);
			},

			onDrop() {
				autoScroller.stop();
				preventUnhandled.stop();

				dragController.stopDrag({ reason: 'DROP' });
			},
		});
	}, [dragController, contextId, updatePointerDrag]);
}
