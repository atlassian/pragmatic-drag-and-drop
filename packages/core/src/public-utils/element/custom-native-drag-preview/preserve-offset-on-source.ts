import { type Input } from '../../../entry-point/types';

import type { GetOffsetFn } from './types';

export function preserveOffsetOnSource({
	element,
	input,
}: {
	element: HTMLElement;
	input: Input;
}): GetOffsetFn {
	return function getOffset({ container }) {
		/**
		 * **Android**
		 *
		 * This function won't do anything 😅.
		 * The drag preview will _always_ be under the center of the users pointer.
		 * There is no harm in calling this function though 🧘.
		 *
		 * **iOS and iPadOS**
		 *
		 * The drag preview is lifted in the expected position and then slides under
		 * the users pointer.
		 * This is more pleasing than immediately putting the center of the drag preview
		 * under the users pointer.
		 * With this function the drag preview looks like it is popping out
		 * of the UI and then it shifts under the users pointer as the drag is occurring ✨
		 */

		const sourceRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const offsetX = Math.min(
			// difference
			input.clientX - sourceRect.x,
			// don't let the difference be more than the width of the container,
			// otherwise the pointer will be off the preview
			containerRect.width,
		);
		const offsetY = Math.min(
			// difference
			input.clientY - sourceRect.y,
			// don't let the difference be more than the height of the container,
			// otherwise the pointer will be off the preview
			containerRect.height,
		);

		return { x: offsetX, y: offsetY };
	};
}
