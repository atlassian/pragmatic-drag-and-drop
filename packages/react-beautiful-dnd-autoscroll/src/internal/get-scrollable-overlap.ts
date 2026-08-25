// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { getOverlap } from './can-scroll';
import { canScrollScrollable } from './can-scroll-scrollable';
import type { Scrollable } from './types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const getScrollableOverlap = (scrollable: Scrollable, change: Position): Position | null => {
	if (!canScrollScrollable(scrollable, change)) {
		return null;
	}

	return getOverlap({
		current: scrollable.scroll.current,
		max: scrollable.scroll.max,
		change,
	});
};
