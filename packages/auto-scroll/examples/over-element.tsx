import React from 'react';

import { autoScrollForElements } from '../src/entry-point/element';

import { Board } from './pieces/board';
import { BoardContext, type TBoardContext } from './pieces/board-context';

const context: TBoardContext = {
	autoScrollColumn: autoScrollForElements,
	autoScrollBoard: autoScrollForElements,
};

export default function OverElement() {
	return (
		<BoardContext.Provider value={context}>
			<Board />
		</BoardContext.Provider>
	);
}
