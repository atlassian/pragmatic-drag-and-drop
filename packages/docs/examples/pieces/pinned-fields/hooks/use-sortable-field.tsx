import { type RefObject, useEffect, useState } from 'react';

import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';

type UseSortableFieldArgs = {
	id: string;
	index: number;
	type: string;
	ref: RefObject<HTMLElement>;

	shouldHideNativeDragPreview?: boolean;

	/**
	 * Used for the Asana clone.
	 */
	shouldHideDropIndicatorForNoopTargets?: boolean;
	isSticky?: boolean;
};

function shouldHideDropIndicator({
	closestEdge,
	sourceIndex,
	targetIndex,
}: {
	closestEdge: Edge | null;
	sourceIndex: number;
	targetIndex: number;
}) {
	const isTargetingSelf = sourceIndex === targetIndex;
	const isTargetingBottomOfPrevious = closestEdge === 'bottom' && targetIndex === sourceIndex - 1;
	const isTargetingTopOfNext = closestEdge === 'top' && targetIndex === sourceIndex + 1;

	return isTargetingSelf || isTargetingBottomOfPrevious || isTargetingTopOfNext;
}

export function useSortableField({
	id,
	index,
	type,
	ref,
	shouldHideNativeDragPreview = false,
	shouldHideDropIndicatorForNoopTargets = true,
	isSticky = true,
}: UseSortableFieldArgs) {
	const [isHovering, setIsHovering] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const data = { id, index, type };

		return combine(
			bindAll(element, [
				{
					type: 'pointerenter',
					listener() {
						setIsHovering(true);
					},
				},
				{
					type: 'pointerleave',
					listener() {
						setIsHovering(false);
					},
				},
			]),
			draggable({
				element,
				getInitialData() {
					return data;
				},
				onGenerateDragPreview({ nativeSetDragImage }) {
					if (shouldHideNativeDragPreview) {
						disableNativeDragPreview({ nativeSetDragImage });
					}
				},
				onDragStart() {
					setIsDragging(true);
				},
				onDrop() {
					setIsDragging(false);
				},
			}),
			dropTargetForElements({
				element,
				getIsSticky() {
					return isSticky;
				},
				canDrop({ source }) {
					return source.data.type === type;
				},
				getData({ input }) {
					return attachClosestEdge(data, {
						element,
						input,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDrag({ self, source }) {
					const closestEdge = extractClosestEdge(self.data);
					const sourceIndex = source.data.index;
					invariant(typeof sourceIndex === 'number');

					if (
						shouldHideDropIndicatorForNoopTargets &&
						shouldHideDropIndicator({
							closestEdge,
							sourceIndex,
							targetIndex: index,
						})
					) {
						setClosestEdge(null);
					} else {
						setClosestEdge(closestEdge);
					}
				},
				onDragLeave() {
					setClosestEdge(null);
				},
				onDrop() {
					setClosestEdge(null);
				},
			}),
		);
	}, [
		id,
		index,
		isSticky,
		ref,
		shouldHideDropIndicatorForNoopTargets,
		shouldHideNativeDragPreview,
		type,
	]);

	return { isHovering, isDragging, closestEdge };
}
