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
 * This function will position the drag preview on the _right hand side for left to right (`ltr`) interfaces_, and on the _left hand side for right to left (`rtl`) languages_.
 *
 * The direction will be calculated based on the direction (`dir`) being applied to the `container`
 * element (which will be a child of the `body` element).
 */
export function pointerOutsideOfPreview(point: { x: CSSValue; y: CSSValue }): GetOffsetFn {
	return ({ container }) => {
		// The only reliable cross browser technique found to push a
		// drag preview away from the cursor is to use transparent borders on the container
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
