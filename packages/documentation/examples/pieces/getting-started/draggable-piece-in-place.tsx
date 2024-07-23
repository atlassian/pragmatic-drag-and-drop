/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { useEffect, useRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import king from '../../icons/king.png';
import pawn from '../../icons/pawn.png';

export type PieceType = 'king' | 'pawn';

type PieceProps = {
	image: string;
	alt: string;
};

function Piece({ image, alt }: PieceProps) {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		invariant(el);

		return draggable({
			element: el,
		});
	}, []);

	return <img css={imageStyles} src={image} alt={alt} ref={ref} />;
}

export function King() {
	return <Piece image={king} alt="King" />;
}

export function Pawn() {
	return <Piece image={pawn} alt="Pawn" />;
}

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

export default King;
