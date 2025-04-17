import type { Direction } from 'react-beautiful-dnd';

const directionMapping = {
	horizontal: {
		rect: {
			start: 'left',
			end: 'right',
		},
	},
	vertical: {
		rect: {
			start: 'top',
			end: 'bottom',
		},
	},
} as const;

/**
 * Computes the distance between two `DOMRect` instances.
 *
 * This is the shortest distance from the end of one to the start of the next.
 */
export function getDistance({
	a,
	b,
	direction,
}: {
	a: DOMRect;
	b: DOMRect;
	direction: Direction;
}): number {
	const { rect } = directionMapping[direction];

	return Math.max(a[rect.start], b[rect.start]) - Math.min(a[rect.end], b[rect.end]);
}
