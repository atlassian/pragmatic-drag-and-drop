import React from 'react';

import { type autoScrollForElements } from '../src/entry-point/element';
import { unsafeOverflowAutoScrollForElements } from '../src/entry-point/unsafe-overflow/element';

import { Board } from './pieces/board';
import { BoardContext, type TBoardContext } from './pieces/board-context';

const context: TBoardContext = {
	autoScrollBoard: (
		args: Parameters<typeof autoScrollForElements>[0],
	): ReturnType<typeof autoScrollForElements> => {
		return unsafeOverflowAutoScrollForElements({
			...args,
			// allow auto scrolling all around the board
			getOverflow: () => ({
				forTopEdge: {
					top: 6000,
					right: 6000,
					left: 6000,
				},
				forRightEdge: {
					top: 6000,
					right: 6000,
					bottom: 6000,
				},
				forBottomEdge: {
					right: 6000,
					bottom: 6000,
					left: 6000,
				},
				forLeftEdge: {
					top: 6000,
					left: 6000,
					bottom: 6000,
				},
			}),
		});
	},
	autoScrollColumn: (
		args: Parameters<typeof autoScrollForElements>[0],
	): ReturnType<typeof autoScrollForElements> => {
		return unsafeOverflowAutoScrollForElements({
			...args,
			// allow auto scrolling above and below the column
			getOverflow: () => ({
				forTopEdge: {
					top: 6000,
					right: 0,
					left: 0,
				},
				forBottomEdge: {
					right: 0,
					bottom: 6000,
					left: 0,
				},
			}),
		});
	},
};

export default function UnsafeOverflowOnly() {
	return (
		<BoardContext.Provider value={context}>
			<Board />
		</BoardContext.Provider>
	);
}
