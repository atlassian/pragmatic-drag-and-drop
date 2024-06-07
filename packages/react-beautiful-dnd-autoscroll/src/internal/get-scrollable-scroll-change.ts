// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { canScrollScrollable } from './can-scroll';
import getScroll from './get-scroll';
import type { Scrollable } from './types';

type Args = {
	scrollable: Scrollable;
	center: Position;
	dragStartTime: number;
	shouldUseTimeDampening: boolean;
};

export default ({
	scrollable,
	center,
	dragStartTime,
	shouldUseTimeDampening,
}: Args): Position | null => {
	const scroll: Position | null = getScroll({
		dragStartTime,
		container: scrollable.container,
		center,
		shouldUseTimeDampening,
	});

	return scroll && canScrollScrollable(scrollable, scroll) ? scroll : null;
};
