import { uniqueKey } from './closest-edge';
import type { Edge } from './closest-edge';

/**
 * Returns the value added by `attachClosestEdge()` to the `userData` object. It will return `null` if there is no value.
 */
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function extractClosestEdge(userData: Record<string | symbol, unknown>): Edge | null {
	return (userData[uniqueKey] as Edge) ?? null;
}
