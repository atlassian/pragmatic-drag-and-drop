/** @jsxRuntime classic */
/** @jsx jsx */
import { memo, ReactNode, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import {
  canMove,
  coord,
  isCoord,
  isEqualCoord,
  PieceRecord,
} from '../../chess';

import { isPieceType } from './piece';

interface SquareProps {
  pieces: PieceRecord[];
  location: coord;
  children: ReactNode;
}

const squareStyles = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const circleIndicatorStyles = css({
  backgroundImage: "url('../../icons/circle.svg')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: '20px 20px',
});

type State =
  | { pieceSelected: false }
  | {
      pieceSelected: true;
      isDraggedOver: boolean;
      isValidMove: boolean;
    };

const getColour = (state: State, isDark: boolean): string => {
  if (state.pieceSelected && state.isValidMove && state.isDraggedOver) {
    return 'lightgreen';
  }
  if (state.pieceSelected && !state.isValidMove && state.isDraggedOver) {
    return 'pink';
  }

  return isDark ? 'lightgrey' : 'white';
};

const isStateEqual = (a: State, b: State): boolean => {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((aKey, index) => aKey === bKeys[index]);
};

const Square = memo(function Square({
  pieces,
  location,
  children,
}: SquareProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<State>({ pieceSelected: false });

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      dropTargetForElements({
        element: el,
        getData: () => ({ location }),
        getDropEffect: () => 'move',
        canDrop: ({ source }) =>
          source.data.type === 'grid-item' &&
          isCoord(source.data.location) &&
          !isEqualCoord(source.data.location, location),
        onDragEnter: () =>
          setState(state => ({ ...state, isDraggedOver: true })),
        onDragLeave: () =>
          setState(state => ({ ...state, isDraggedOver: false })),
      }),
      monitorForElements({
        onDragStart({ source }) {
          if (
            !isCoord(source.data.location) ||
            !isPieceType(source.data.pieceType) ||
            isEqualCoord(source.data.location, location)
          ) {
            return;
          }

          if (
            canMove(
              source.data.location,
              location,
              source.data.pieceType,
              pieces,
            )
          ) {
            setState(current => {
              const proposed = {
                pieceSelected: true,
                isDraggedOver: false,
                isValidMove: true,
              };
              return isStateEqual(current, proposed) ? current : proposed;
            });
          } else {
            setState(current => {
              const proposed = {
                pieceSelected: true,
                isDraggedOver: false,
                isValidMove: false,
              };
              return isStateEqual(current, proposed) ? current : proposed;
            });
          }
        },
        onDrop() {
          setState({
            pieceSelected: false,
          });
        },
      }),
    );
  }, [location, pieces]);

  const isDark = (location[0] + location[1]) % 2 === 1;
  const colour = getColour(state, isDark);

  return (
    <div
      css={[
        squareStyles,
        state.pieceSelected && state.isValidMove && circleIndicatorStyles,
      ]}
      style={{ backgroundColor: colour }}
      ref={ref}
    >
      {children}
    </div>
  );
});

export default Square;
