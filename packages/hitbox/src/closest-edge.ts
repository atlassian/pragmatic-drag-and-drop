/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
import type { Edge as EdgeRaw } from './types';

// re-exporting type to make it easy to use
export type Edge = EdgeRaw;

// using a symbol so we can guarantee a key with a unique value
export const uniqueKey: any = Symbol('closestEdge');

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { attachClosestEdge } from './attach-closest-edge';
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { extractClosestEdge } from './extract-closest-edge';
