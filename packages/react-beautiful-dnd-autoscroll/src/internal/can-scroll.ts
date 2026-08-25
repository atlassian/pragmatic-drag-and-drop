// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { add } from './add';
import { isEqual } from './is-equal';
import { origin } from './position';

type GetRemainderArgs = {
	current: Position;
	max: Position;
	change: Position;
};

// We need to figure out how much of the movement
// cannot be done with a scroll
export const getOverlap: ({ current, max, change }: GetRemainderArgs) => Position | null = (() => {
	const getRemainder = (target: number, max: number): number => {
		if (target < 0) {
			return target;
		}
		if (target > max) {
			return target - max;
		}
		return 0;
	};

	return ({ current, max, change }: GetRemainderArgs): Position | null => {
		const targetScroll: Position = add(current, change);

		const overlap: Position = {
			x: getRemainder(targetScroll.x, max.x),
			y: getRemainder(targetScroll.y, max.y),
		};

		if (isEqual(overlap, origin)) {
			return null;
		}

		return overlap;
	};
})();
