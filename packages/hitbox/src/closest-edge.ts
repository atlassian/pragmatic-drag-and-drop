/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
import type { Edge as EdgeRaw } from './types';

/**
 * @deprecated Import `Edge` from `@atlaskit/pragmatic-drag-and-drop-hitbox/types` instead.
 */
export type Edge = EdgeRaw;

/**
 * @deprecated This implementation detail will be removed in a future release.
 */
// using a symbol so we can guarantee a key with a unique value
export const uniqueKey: any = Symbol('closestEdge');

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
/**
 * @deprecated Import `attachClosestEdge` from `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge` instead.
 */
export { attachClosestEdge } from './attach-closest-edge';
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
/**
 * @deprecated Import `extractClosestEdge` from `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge` instead.
 */
export { extractClosestEdge } from './extract-closest-edge';
