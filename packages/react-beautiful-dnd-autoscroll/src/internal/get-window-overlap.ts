// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { getOverlap } from './can-scroll';
import { canScrollWindow } from './can-scroll-window';
import type { Viewport } from './types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const getWindowOverlap = (viewport: Viewport, change: Position): Position | null => {
	if (!canScrollWindow(viewport, change)) {
		return null;
	}

	const max: Position = viewport.scroll.max;
	const current: Position = viewport.scroll.current;

	return getOverlap({
		current,
		max,
		change,
	});
};
