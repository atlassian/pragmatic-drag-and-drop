import { isSafariOnIOS } from '../../../util/is-safari-on-ios';

import type { GetOffsetFn } from './types';

/** Any valid CSS string value
 * @example `calc(var(--grid) * 2)
 */
type CSSValue = string;

/**
 * Position the native drag preview **in front** of the users pointer.
 *
 * **Distance**
 *
 * If the total width of your preview (including the offset applied by this function)
 * exceeds `280px` then the drag preview will have more opacity applied on Windows.
 *
 * https://atlassian.design/components/pragmatic-drag-and-drop/web-platform-design-constraints
 *
 * **Direction**
 *
 * This function will position the drag preview on the _right hand side for left to right (`ltr`) interfaces_, and on the _left hand side for right to left (`rtl`) languages_.
 *
 * The direction will be calculated based on the direction (`dir`) being applied to the `container`
 * element (which will be a child of the `body` element).
 *
 * **iOS**
 *
 * This function will not push the preview away from the users pointer on iOS due to platform limitations.
 * On iOS the preview will start the drag on the top left corner (or top right corner for right to left interfaces).
 * While dragging, iOS will shift the drag preview under the center of the users pointer, so the "pushing away"
 * is short lived on iOS.
 */
export function pointerOutsideOfPreview(point: { x: CSSValue; y: CSSValue }): GetOffsetFn {
	return ({ container }) => {
		/**
		 * **Approach: transparent borders.**
		 *
		 * The only reliable cross browser technique found to push a
		 * drag preview away from the cursor is to use transparent borders on the container.
		 *
		 * **🙅📱 Not pushing the preview away on iOS**
		 *
		 * On iOS, the browser will set the transparent border color to be black. We can provide a
		 * more polished experience not using the transparent border on iOS.
		 *
		 * While dragging, iOS will shift the drag preview under the center of the users pointer,
		 * so the "pushing away" of the preview is short lived on iOS anyway.
		 *
		 * Notes:
		 *
		 * - Tested on `iOS@18.4.1` on May 7th 2025
		 * - If you set the background color on the `container` the border color will be that
		 * - Setting a transparent background color on the `container` still results in a black border
		 * - The `<body>` text or background color does not change the black border color
		 */
		if (!isSafariOnIOS()) {
			Object.assign(container.style, {
				borderInlineStart: `${point.x} solid transparent`,
				borderTop: `${point.y} solid transparent`,
			});
		}

		// Unfortunate that we need to use `getComputedStyle`,
		// but it's only a single call when the drag is starting.
		const computed = window.getComputedStyle(container);
		if (computed.direction === 'rtl') {
			// The DOMRect will include the new border we added
			const box = container.getBoundingClientRect();

			// Use the top right corner (including the new border) as the offset.
			// The border will push the preview away from the pointer.
			return { x: box.width, y: 0 };
		}

		// Use the top left corner as the offset. The border will
		// push the preview away from the pointer.
		return { x: 0, y: 0 };
	};
}
