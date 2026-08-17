import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { uniqueKey } from './closest-edge';
import type { Edge } from './closest-edge';

const getDistanceToEdge: {
	[TKey in Edge]: (rect: DOMRect, client: Position) => number;
} = {
	top: (rect, client) => Math.abs(client.y - rect.top),
	right: (rect, client) => Math.abs(rect.right - client.x),
	bottom: (rect, client) => Math.abs(rect.bottom - client.y),
	left: (rect, client) => Math.abs(client.x - rect.left),
};

/**
 * Adds a unique `Symbol` to the `userData` object. Use with `extractClosestEdge()` for type safe lookups.
 */
export function attachClosestEdge(
	userData: Record<string | symbol, unknown>,
	{
		element,
		input,
		allowedEdges,
	}: {
		element: Element;
		input: Input;
		allowedEdges: Edge[];
	},
): Record<string | symbol, unknown> {
	const client: Position = {
		x: input.clientX,
		y: input.clientY,
	};
	// I tried caching the result of `getBoundingClientRect()` for a single
	// frame in order to improve performance.
	// However, on measurement I saw no improvement. So no longer caching
	const rect: DOMRect = element.getBoundingClientRect();
	const entries = allowedEdges.map((edge) => {
		return {
			edge,
			value: getDistanceToEdge[edge](rect, client),
		};
	});

	// edge can be `null` when `allowedEdges` is []
	const addClosestEdge: Edge | null = entries.sort((a, b) => a.value - b.value)[0]?.edge ?? null;

	return {
		...userData,
		[uniqueKey]: addClosestEdge,
	};
}
