/** @jsxRuntime classic */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactNode, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import {
	canMove,
	type Coord,
	isCoord,
	isEqualCoord,
	isPieceType,
	type PieceRecord,
} from './chessboard-colored-drop-targets';

interface SquareProps {
	pieces: PieceRecord[];
	location: Coord;
	children: ReactNode;
}

type HoveredState = 'idle' | 'validMove' | 'invalidMove';

const squareStyles = css({
	width: '100%',
	height: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
});

function getColor(state: HoveredState, isDark: boolean): string {
	if (state === 'validMove') {
		return 'lightgreen';
	} else if (state === 'invalidMove') {
		return 'pink';
	}
	return isDark ? 'lightgrey' : 'white';
}

function Square({ pieces, location, children }: SquareProps) {
	const ref = useRef(null);
	const [state, setState] = useState<HoveredState>('idle');

	useEffect(() => {
		const el = ref.current;
		invariant(el);

		return dropTargetForElements({
			element: el,
			getData: () => ({ location }),
			canDrop: ({ source }) => {
				if (!isCoord(source.data.location)) {
					return false;
				}

				return !isEqualCoord(source.data.location, location);
			},
			onDragEnter: ({ source }) => {
				if (!isCoord(source.data.location) || !isPieceType(source.data.pieceType)) {
					return;
				}

				if (canMove(source.data.location, location, source.data.pieceType, pieces)) {
					setState('validMove');
				} else {
					setState('invalidMove');
				}
			},
			onDragLeave: () => setState('idle'),
			onDrop: () => setState('idle'),
		});
	}, [location, pieces]);

	const isDark = (location[0] + location[1]) % 2 === 1;

	return (
		<div css={squareStyles} style={{ backgroundColor: getColor(state, isDark) }} ref={ref}>
			{children}
		</div>
	);
}

export default Square;
