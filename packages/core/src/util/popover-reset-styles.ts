import type { CSSProperties } from 'react';

/**
 * Resets user agent styles for `[popover]` elements.
 *
 * Browsers apply these defaults to popovers (per the WHATWG HTML spec rendering section):
 * - `inset: 0` + `margin: auto` → centers the popover in the viewport
 * - `border: solid` → visible border
 * - `padding: 0.25em` → internal spacing
 * - `overflow: auto` → scrollbars when content overflows
 * - `color: CanvasText` + `background-color: Canvas` → system theme colors
 *
 * This object neutralizes those defaults so the popover behaves like a plain
 * positioned element. `width` and `height` (UA default: `fit-content`) are not
 * reset here because consumers set their own dimensions.
 */
export const popoverResetUserAgentStyles: CSSProperties = {
	inset: 'unset',
	border: 'none',
	padding: 0,
	margin: 0,
	overflow: 'visible',
	color: 'inherit',
	background: 'transparent',
};
