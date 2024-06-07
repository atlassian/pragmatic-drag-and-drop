import { createContext } from 'react';

import { type autoScrollForElements } from '../../src/entry-point/element';

export type TBoardContext = {
	autoScrollColumn: typeof autoScrollForElements;
	autoScrollBoard: typeof autoScrollForElements;
};

export const BoardContext = createContext<TBoardContext | null>(null);
