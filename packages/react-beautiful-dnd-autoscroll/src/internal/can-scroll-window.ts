// Source: https://github.com/atlassian/react-beautiful-dnd

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { canPartiallyScroll } from './can-partially-scroll';
import type { Viewport } from './types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const canScrollWindow = (viewport: Viewport, change: Position): boolean =>
	canPartiallyScroll({
		current: viewport.scroll.current,
		max: viewport.scroll.max,
		change,
	});
