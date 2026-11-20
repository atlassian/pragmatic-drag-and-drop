import { createContext, type Context } from 'react';

import { type autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';

export type TBoardContext = {
	autoScrollColumn: typeof autoScrollForElements;
	autoScrollBoard: typeof autoScrollForElements;
};

export const BoardContext: Context<TBoardContext | null> = createContext<TBoardContext | null>(
	null,
);
