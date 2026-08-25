// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { canPartiallyScroll } from './can-partially-scroll';
import type { Scrollable } from './types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const canScrollScrollable = (scrollable: Scrollable, change: Position): boolean => {
	return canPartiallyScroll({
		current: scrollable.scroll.current,
		max: scrollable.scroll.max,
		change,
	});
};
