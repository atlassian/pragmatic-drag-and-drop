import type { GetOffsetFn } from './types';

/** Any valid CSS string value
 * @example `calc(var(--grid) * 2)
 */
type CSSValue = string;

/**
 * Position the native drag preview outside of the users pointer
 */
export function pointerOutsideOfPreview(point: { x: CSSValue; y: CSSValue }): GetOffsetFn {
	return ({ container }) => {
		// Only reliable cross browser technique found to push a
		// drag preview away from the cursor is to use transparent borders on the container
		Object.assign(container.style, {
			borderLeft: `${point.x} solid transparent`,
			borderTop: `${point.y} solid transparent`,
		});
		return { x: 0, y: 0 };
	};
}
