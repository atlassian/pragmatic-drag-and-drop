// eslint-disable-next-line import/no-extraneous-dependencies
import type { Direction } from 'react-beautiful-dnd';

import { rbdInvariant } from '../../drag-drop-context/rbd-invariant';
import { customAttributes, getAttribute } from '../../utils/attributes';
import { getElementByDraggableLocation } from '../../utils/get-element-by-draggable-location';

import { getDistance } from './get-distance';

function getDroppableId(element: HTMLElement) {
	return getAttribute(element, customAttributes.draggable.droppableId);
}

function getIndex(element: HTMLElement): number {
	const value = getAttribute(element, customAttributes.draggable.index);
	const index = parseInt(value);
	rbdInvariant(Number.isInteger(index), `invalid index: '${index}' is not an integer`);
	return index;
}

/**
 * ASSUMPTIONS:
 * - Adjacent `<Draggable>` items are visually adjacent.
 * - If there is an adjacent element, it is rendered.
 */
export function calculateGap({
	element,
	where,
	direction,
	contextId,
}: {
	element: HTMLElement;
	where: 'before' | 'after';
	direction: Direction;
	contextId: string;
}): number {
	const droppableId = getDroppableId(element);
	const index = getIndex(element);

	const indexBefore = index - 1;
	const indexAfter = index + 1;

	const isBefore = where === 'before';

	const adjacentElement = getElementByDraggableLocation(contextId, {
		droppableId,
		index: isBefore ? indexBefore : indexAfter,
	});

	if (adjacentElement === null) {
		/**
		 * If there is no adjacent element, we can guess based on margins.
		 */
		const { marginTop, marginRight, marginBottom, marginLeft } = getComputedStyle(element);

		if (direction === 'horizontal') {
			return parseFloat(marginLeft) + parseFloat(marginRight);
		}

		return parseFloat(marginTop) + parseFloat(marginBottom);
	}

	const distance = getDistance({
		direction,
		a: element.getBoundingClientRect(),
		b: adjacentElement.getBoundingClientRect(),
	});

	return distance;
}

export function getGapOffset({
	element,
	where,
	direction,
	contextId,
}: {
	element: HTMLElement;
	where: 'before' | 'after';
	direction: Direction;
	contextId: string;
}): number {
	const gap = calculateGap({
		element,
		where,
		direction,
		contextId,
	});

	if (where === 'before') {
		return -gap / 2;
	}

	return gap / 2;
}
