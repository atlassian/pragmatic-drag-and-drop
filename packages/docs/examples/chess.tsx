/** @jsx jsx */
import { useEffect, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { isPieceType, pieceLookup, type PieceType } from './pieces/chess/piece';
import Square from './pieces/chess/square';

export type coord = [number, number];

export type PieceRecord = {
	type: PieceType;
	location: coord;
};

export const isCoord = (token: unknown): token is coord =>
	Array.isArray(token) && token.length === 2 && token.every((val) => typeof val === 'number');

export const isEqualCoord = (c1: coord, c2: coord): boolean => c1[0] === c2[0] && c1[1] === c2[1];

const boardContainerStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(8, 1fr)',
	gridTemplateRows: 'repeat(8, 1fr)',
	width: '600px',
	height: '600px',
	border: '3px solid lightgrey',
});

export const canMove = (
	start: coord,
	destination: coord,
	pieceType: PieceType,
	pieces: PieceRecord[],
) => {
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
};

const Chessboard = () => {
	const [pieces, setPieces] = useState<PieceRecord[]>([
		{ type: 'king', location: [3, 3] },
		{ type: 'pawn', location: [1, 6] },
	]);

	useEffect(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				const destination = location.current.dropTargets[0];
				if (!destination) {
					return;
				}
				const destinationLocation = destination.data.location;
				const sourceLocation = source.data.location;
				const pieceType = source.data.pieceType;

				if (!isCoord(destinationLocation) || !isCoord(sourceLocation) || !isPieceType(pieceType)) {
					return;
				}

				const piece = pieces.find((p) => isEqualCoord(p.location, sourceLocation));
				const restOfPieces = pieces.filter((p) => p !== piece);

				if (
					canMove(sourceLocation, destinationLocation, pieceType, pieces) &&
					piece !== undefined
				) {
					setPieces([{ type: piece.type, location: destinationLocation }, ...restOfPieces]);
				}
			},
		});
	}, [pieces]);

	const renderBoard = () => {
		const squares = [];
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const piece = pieces.find((piece) => isEqualCoord(piece.location, [row, col]));

				squares.push(
					<Square pieces={pieces} key={`${row}-${col}`} location={[row, col]}>
						{piece && pieceLookup[piece.type]([row, col])}
					</Square>,
				);
			}
		}
		return squares;
	};

	return <div css={boardContainerStyles}>{renderBoard()}</div>;
};

export default Chessboard;
