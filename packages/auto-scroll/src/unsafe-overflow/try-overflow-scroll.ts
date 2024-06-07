import type { AllDragTypes, Input } from '@atlaskit/pragmatic-drag-and-drop/types';

import { type ElementGetFeedbackArgs } from '../internal-types';
import { getInternalConfig } from '../shared/configuration';

import { getScrollBy } from './get-scroll-by';
import { type UnsafeOverflowAutoScrollArgs } from './types';

export function tryOverflowScrollElements<DragType extends AllDragTypes>({
	input,
	source,
	entries,
	timeSinceLastFrame,
	underUsersPointer,
}: {
	input: Input;
	timeSinceLastFrame: number;
	underUsersPointer: Element | null;
	source: DragType['payload'];
	entries: UnsafeOverflowAutoScrollArgs<DragType>[];
}): void {
	// For now we are auto scrolling any element that wants to.
	// Otherwise it's hard to know what should scroll first as we might
	// be scrolling elements that have no hierarchical relationship
	for (const entry of entries) {
		// "overflow" scrolling not relevant when directly over the element
		// "over element" scrolling is responsible for scrolling when over an element
		// 1. If we are over the element, then we want to exit and let the "overflow" scroller take over
		// 2. The overflow hitbox area for an edge actually stretches over the element
		//    This check is used to "mask" or "cut out" the element hitbox from the overflow hitbox
		if (entry.element.contains(underUsersPointer)) {
			continue;
		}

		const feedback: ElementGetFeedbackArgs<DragType> = {
			input,
			source,
			element: entry.element,
		};

		// Scrolling not allowed for this entity
		// Note: not marking engagement if an entity is opting out of scrolling
		if (entry.canScroll && !entry.canScroll(feedback)) {
			continue;
		}

		const config = getInternalConfig(entry.getConfiguration?.(feedback));
		const allowedAxis = entry.getAllowedAxis?.(feedback) ?? 'all';

		const scrollBy = getScrollBy({
			entry,
			input,
			timeSinceLastFrame,
			allowedAxis,
			config,
		});

		if (scrollBy) {
			entry.element.scrollBy(scrollBy);
		}
	}
}
