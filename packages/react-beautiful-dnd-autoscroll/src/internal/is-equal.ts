// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const isEqual = (point1: Position, point2: Position): boolean =>
	point1.x === point2.x && point1.y === point2.y;
