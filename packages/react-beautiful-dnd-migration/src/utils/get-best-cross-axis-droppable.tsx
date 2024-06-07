// eslint-disable-next-line import/no-extraneous-dependencies
import type { DroppableId } from 'react-beautiful-dnd';

import type { DroppableRegistry } from '../drag-drop-context/droppable-registry';

import { attributes, customAttributes, getAttribute } from './attributes';
import { findElementAll } from './find-element';

function getDroppablesOfType({
	contextId,
	type,
}: {
	type: string;
	contextId: string;
}): HTMLElement[] {
	return findElementAll(
		{ attribute: attributes.droppable.contextId, value: contextId },
		{ attribute: customAttributes.droppable.type, value: type },
	);
}

/**
 * This is similar to the function of the same name in `react-beautiful-dnd`.
 *
 * Many of the checks from rbd are removed though, such as visibility checks.
 */
export function getBestCrossAxisDroppable({
	droppableId,
	type,
	isMovingForward,
	contextId,
	droppableRegistry,
}: {
	droppableId: DroppableId;
	type: string;
	isMovingForward: boolean;
	contextId: string;
	droppableRegistry: DroppableRegistry;
}): HTMLElement | null {
	const droppables = getDroppablesOfType({ contextId, type });

	const currentIndex = droppables.findIndex(
		(element: HTMLElement) => getAttribute(element, attributes.droppable.id) === droppableId,
	);

	const candidates = droppables
		.filter((_, index) => {
			/**
			 * We are following the DOM order of the droppables,
			 * so keep only those that are before/after the current.
			 */
			if (isMovingForward) {
				return index > currentIndex;
			}
			return index < currentIndex;
		})
		.filter((element: HTMLElement) => {
			/**
			 * Filter out the disabled droppables.
			 */
			const droppableId = getAttribute(element, attributes.droppable.id);
			const entry = droppableRegistry.getEntry({ droppableId });

			const isValidCandidate = entry && !entry.isDropDisabled;
			return isValidCandidate;
		});

	/**
	 * If we're moving forward then take the first candidate,
	 * if moving backwards take the last candidate
	 * (because it is closest to where the current is).
	 *
	 * Using `.at()` provides a safer type, making us handle the `undefined` case.
	 */
	const bestCandidate = isMovingForward ? candidates.at(0) : candidates.at(-1);

	return bestCandidate ?? null;
}
