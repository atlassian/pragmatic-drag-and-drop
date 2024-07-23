/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactElement } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { King, Pawn } from './draggable-piece-with-state';
import Square from './square-drop-target';

export type Coord = [number, number];

export type PieceRecord = {
	type: PieceType;
	location: Coord;
};

export type PieceType = 'king' | 'pawn';

export function isEqualCoord(c1: Coord, c2: Coord): boolean {
	return c1[0] === c2[0] && c1[1] === c2[1];
}

export const pieceLookup: {
	[Key in PieceType]: () => ReactElement;
} = {
	king: () => <King />,
	pawn: () => <Pawn />,
};

function renderSquares(pieces: PieceRecord[]) {
	const squares = [];
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const squareCoord: Coord = [row, col];

			const piece = pieces.find((piece) => isEqualCoord(piece.location, squareCoord));

			squares.push(<Square location={squareCoord}>{piece && pieceLookup[piece.type]()}</Square>);
		}
	}
	return squares;
}

function Chessboard() {
	const pieces: PieceRecord[] = [
		{ type: 'king', location: [3, 2] },
		{ type: 'pawn', location: [1, 6] },
	];

	return <div css={chessboardStyles}>{renderSquares(pieces)}</div>;
}

const chessboardStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(8, 1fr)',
	gridTemplateRows: 'repeat(8, 1fr)',
	width: '500px',
	height: '500px',
	border: '3px solid lightgrey',
});

export default Chessboard;
