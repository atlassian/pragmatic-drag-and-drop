import type { Input } from '@atlaskit/pragmatic-drag-and-drop/types';

import { type ScrollBehavior } from './internal/types';
import { createAutoScroller } from './createAutoScroller';

export const autoScroller: {
	start: ({ input, behavior }: { input: Input; behavior?: ScrollBehavior }) => void;
	updateInput: ({ input }: { input: Input }) => void;
	stop: () => void;
} = createAutoScroller();
