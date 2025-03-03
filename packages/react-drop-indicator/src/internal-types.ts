/**
 * Any valid CSS size value
 *
 * @example
 *
 * - "2px"
 * - "4rem"
 * // ADS tokens (which resolve to CSS size values)
 * - token('border.width.outline')
 */
export type CSSSize = string;

/**
 * Any valid CSS color value
 *
 * @example
 *
 * - "#663399"
 * - "rgb(102, 51, 153)"
 * - "hsl(270, 50%, 40%)"
 * - "rebeccapurple"
 * // ADS tokens (which resolve to CSS color values)
 * - token('color.border.selected')
 */
export type CSSColor = string;

export type StrokeWidth = 'standard' | (CSSSize & {});
export type StrokeColor = 'standard' | 'warning' | (CSSColor & {});
