/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactElement } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { King, Pawn } from './draggable-piece-with-data';
import Square from './square-with-hovering-coloring';

export type Coord = [number, number];

export type PieceRecord = {
	type: PieceType;
	location: Coord;
};

export type PieceType = 'king' | 'pawn';

export function isCoord(token: unknown): token is Coord {
	return (
		Array.isArray(token) && token.length === 2 && token.every((val) => typeof val === 'number')
	);
}

const pieceTypes: PieceType[] = ['king', 'pawn'];

export function isPieceType(value: unknown): value is PieceType {
	return typeof value === 'string' && pieceTypes.includes(value as PieceType);
}

export function isEqualCoord(c1: Coord, c2: Coord): boolean {
	return c1[0] === c2[0] && c1[1] === c2[1];
}

export const pieceLookup: {
	[Key in PieceType]: (location: [number, number]) => ReactElement;
} = {
	king: (location) => <King location={location} />,
	pawn: (location) => <Pawn location={location} />,
};

export function canMove(
	start: Coord,
	destination: Coord,
	pieceType: PieceType,
	pieces: PieceRecord[],
) {
	const rowDist = Math.abs(start[0] - destination[0]);
	const colDist = Math.abs(start[1] - destination[1]);

	if (pieces.find((piece) => isEqualCoord(piece.location, destination))) {
		return false;
	}

	switch (pieceType) {
		case 'king':
			return [0, 1].includes(rowDist) && [0, 1].includes(colDist);
		case 'pawn':
			return colDist === 0 && start[0] - destination[0] === -1;
		default:
			return false;
	}
}

function renderSquares(pieces: PieceRecord[]) {
	const squares = [];
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const squareCoord: Coord = [row, col];

			const piece = pieces.find((piece) => isEqualCoord(piece.location, squareCoord));

			squares.push(
				<Square pieces={pieces} location={squareCoord}>
					{piece && pieceLookup[piece.type](squareCoord)}
				</Square>,
			);
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
