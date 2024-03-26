import type { Position } from '../../../internal-types';

/** A function that will push the position of native drag preview.
 *
 * `{x: 0, y: 0}` represents having the users pointer user the top left corner of the drag preview.
 *
 * @example
 * `const rect = container.getBoundingClientRect()`
 *
 * - `{x: 0, y: 0}` → top left of the `container` will be under the users pointer **(default)**
 * - `{x: rect.width, y: 0}` → top right of the `container` will be under the users pointer
 * - `{x: rect.width, y: rect.height}` → bottom right of the `container` will be under the users pointer
 * - `{x: 0, y: rect.height}`→  bottom left of the `container` will be under the users pointer
 */
export type GetOffsetFn = (args: { container: HTMLElement }) => Position;
