import { isAndroid } from '../../../util/android';
import { isSafariOnIOS } from '../../../util/is-safari-on-ios';

import { centerUnderPointer } from './center-under-pointer';
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
 * **iOS, iPadOS and Android**
 *
 * The drag preview will be centered under the users pointer rather than
 * pushed away on iOS due to platform limitations.
 */
export function pointerOutsideOfPreview(point: { x: CSSValue; y: CSSValue }): GetOffsetFn {
	return function getOffset({ container }) {
		/**
		 * **Approach: transparent borders.**
		 *
		 * The only reliable cross browser technique found to push a
		 * drag preview away from the cursor is to use transparent borders on the container.
		 *
		 * **🙅📱 Not pushing the preview away on touch devices**
		 *
		 * _On iOS_
		 *
		 * Safari will set the transparent border color to be black
		 *
		 * `iOS@18.4.1` on May 7th 2025:
		 * - If you set the background color on the `container` the border color will be that
		 * - Setting a transparent background color on the `container` still results in a
		 *   black border
		 * - The `<body>` text or background color does not change the black border color
		 *
		 * While dragging, the drag preview will shift under the center of the users pointer.
		 * So if you start at {x: 0, y: 0} (top left), almost immediately the preview will move
		 * to be under the middle of the users pointer.
		 *
		 * _On Android_
		 *
		 * Chrome will put the center of the drag preview under the users pointer immediately.
		 *
		 * Tested on `Chrome@137` on `Android 14` on June 20th 2025
		 *
		 * _What we do_
		 *
		 * We don't add the transparent border
		 *
		 * - Avoid the black color on iOS
		 * - It isn't needed on Android anyway as the preview will be under the center
		 *   of the users pointer
		 *
		 * We put the center of the drag preview under the users pointer
		 *
		 * - Avoids the drag preview quickly moving from a top corner to be centered under
		 *   the users pointer on iOS
		 * - It will be under the center on Android no matter what we do
		 *
		 * We previously had a isTouchDevice() check, but it felt safer for now
		 * to have a more targeted check, as these are the devices that have been
		 * tested on.
		 */
		if (isSafariOnIOS() || isAndroid()) {
			return centerUnderPointer({ container });
		}

		Object.assign(container.style, {
			borderInlineStart: `${point.x} solid transparent`,
			borderTop: `${point.y} solid transparent`,
		});

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
