// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

// used to apply any function to both values of a point
// eg: const floor = apply(Math.floor)(point);
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const apply: any =
	(fn: (value: number) => number) =>
	(point: Position): Position => ({
		x: fn(point.x),
		y: fn(point.y),
	});
