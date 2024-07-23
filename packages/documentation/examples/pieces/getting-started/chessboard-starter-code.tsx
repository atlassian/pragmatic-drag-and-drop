/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactElement } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import king from '../../icons/king.png';
import pawn from '../../icons/pawn.png';

export type Coord = [number, number];

export type PieceRecord = {
	type: PieceType;
	location: Coord;
};

export type PieceType = 'king' | 'pawn';

type PieceProps = {
	image: string;
	alt: string;
};

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

			const isDark = (row + col) % 2 === 1;

			squares.push(
				<div css={squareStyles} style={{ backgroundColor: isDark ? 'lightgrey' : 'white' }}>
					{piece && pieceLookup[piece.type]()}
				</div>,
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

function Piece({ image, alt }: PieceProps) {
	return <img css={imageStyles} src={image} alt={alt} draggable="false" />; // draggable set to false to prevent dragging of the images
}

export function King() {
	return <Piece image={king} alt="King" />;
}

export function Pawn() {
	return <Piece image={pawn} alt="Pawn" />;
}

const chessboardStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(8, 1fr)',
	gridTemplateRows: 'repeat(8, 1fr)',
	width: '500px',
	height: '500px',
	border: '3px solid lightgrey',
});

const squareStyles = css({
	width: '100%',
	height: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
});

const imageStyles = css({
	width: 45,
	height: 45,
	padding: 4,
	borderRadius: 6,
	boxShadow: '1px 3px 3px rgba(9, 30, 66, 0.25),0px 0px 1px rgba(9, 30, 66, 0.31)',
	'&:hover': {
		backgroundColor: 'rgba(168, 168, 168, 0.25)',
	},
});

export default Chessboard;
