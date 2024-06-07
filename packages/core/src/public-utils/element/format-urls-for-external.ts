/**
 * Helps to add multiple URLs for external consumption
 *
 * @example
 *
 * ```ts
 * // 🤩 with `formatURLsForExternal`
 * draggable({
 *   element,
 *   getInitialDataForExternal() {
 *     return {
 *       'text/uri-list': formatURLsForExternal([
 *         'https://atlassian.design/',
 *         'https://domevents.dev/',
 *       ]),
 *     };
 *   },
 * });
 *
 * // 🤮 without the `formatURLsForExternal()`
 * draggable({
 *   element,
 *   getInitialDataForExternal() {
 *     return {
 *       'text/uri-list': 'https://atlassian.design/\r\nhttps://domevents.dev/',
 *     };
 *   },
 * });
 * ```
 */
export function formatURLsForExternal(urls: string[]): string {
	return urls.join('\r\n');
}
