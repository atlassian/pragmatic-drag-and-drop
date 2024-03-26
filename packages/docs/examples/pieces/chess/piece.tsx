/** @jsx jsx */
import { memo, ReactElement, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import king from '../../icons/king.png';
import pawn from '../../icons/pawn.png';

export const pieceLookup: {
  [Key in PieceType]: (location: [number, number]) => ReactElement;
} = {
  king: location => <King location={location} />,
  pawn: location => <Pawn location={location} />,
};

export type PieceType = 'king' | 'pawn';
const pieceTypes: PieceType[] = ['king', 'pawn'];

export const isPieceType = (value: unknown): value is PieceType =>
  typeof value === 'string' && pieceTypes.includes(value as PieceType);

const imageSizeStyles = css({
  width: 60,
  height: 60,
});

const hidePieceStyles = css({
  opacity: 0,
});

const Piece = memo(function Piece({
  location,
  pieceType,
  image,
  alt,
}: {
  location: [number, number];
  pieceType: PieceType;
  image: string;
  alt: string;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({ type: 'grid-item', location, pieceType }),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });
  }, [location, pieceType]);

  return (
    <img
      css={[dragging && hidePieceStyles, imageSizeStyles]}
      src={image}
      alt={alt}
      ref={ref}
    />
  );
});

export const King = ({ location }: { location: [number, number] }) => (
  <Piece location={location} pieceType={'king'} image={king} alt="King" />
);

export const Pawn = ({ location }: { location: [number, number] }) => (
  <Piece location={location} pieceType={'pawn'} image={pawn} alt="Pawn" />
);
