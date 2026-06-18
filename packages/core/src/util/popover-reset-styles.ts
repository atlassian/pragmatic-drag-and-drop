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
 * positioned `<div>`, matching the sizing of the legacy (non-popover)
 * fallback container exactly.
 *
 * **Width and height (`auto`)**
 *
 * `width` and `height` override the spec user agent value of `fit-content`
 * with `auto`.
 *
 * _Why?_
 *
 * - When a `[popover]` is sized with `fit-content` and contains a flex
 *   container, Safari collapses any flex item that uses `overflow: auto`
 *   to `0px`.
 * - Setting the popover's `width` and `height` to `auto` skips the `fit-content`
 *   pass and avoids the bug in Safari
 * - Chromium and Firefox tolerate `fit-content` here, but `auto` is safe
 *   everywhere and matches our non-popover path
 */
export const popoverResetUserAgentStyles: CSSProperties = {
	inset: 'unset',
	border: 'none',
	padding: 0,
	margin: 0,
	overflow: 'visible',
	color: 'inherit',
	background: 'transparent',
	width: 'auto',
	height: 'auto',
};
