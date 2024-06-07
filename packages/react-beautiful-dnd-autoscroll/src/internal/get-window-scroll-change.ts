// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { canScrollWindow } from './can-scroll';
import getScroll from './get-scroll';
import type { Viewport } from './types';

type Args = {
	viewport: Viewport;
	center: Position;
	dragStartTime: number;
	shouldUseTimeDampening: boolean;
};

export default ({
	viewport,
	center,
	dragStartTime,
	shouldUseTimeDampening,
}: Args): Position | null => {
	const scroll: Position | null = getScroll({
		dragStartTime,
		container: viewport.container,
		center,
		shouldUseTimeDampening,
	});

	return scroll && canScrollWindow(viewport, scroll) ? scroll : null;
};
