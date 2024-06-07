// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export const origin: Position = { x: 0, y: 0 };

// used to apply any function to both values of a point
// eg: const floor = apply(Math.floor)(point);
export const apply =
	(fn: (value: number) => number) =>
	(point: Position): Position => ({
		x: fn(point.x),
		y: fn(point.y),
	});

export const isEqual = (point1: Position, point2: Position): boolean =>
	point1.x === point2.x && point1.y === point2.y;

export const add = (point1: Position, point2: Position): Position => ({
	x: point1.x + point2.x,
	y: point1.y + point2.y,
});

export const subtract = (point1: Position, point2: Position): Position => ({
	x: point1.x - point2.x,
	y: point1.y - point2.y,
});
