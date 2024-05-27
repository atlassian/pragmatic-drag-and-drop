/** @jsx jsx */

import { Fragment, memo, type ReactNode, useEffect, useRef } from 'react';

import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { autoScrollForExternal } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/external';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { token } from '@atlaskit/tokens';

import { columnGap, gridSize } from '../../util/constants';
import { GlobalStyles } from '../../util/global-styles';

const boardStyles = css({
  '--grid': `${gridSize}px`,
  display: 'flex',
  gap: columnGap,
  flexDirection: 'row',
  height: '100%',
  padding: columnGap,
  boxSizing: 'border-box',
  width: 'min-content', // doing this so that we get the correct padding around the element
});

const scrollContainerStyles = css({
  border: `${token('border.width', '2px')} solid ${token(
    'color.chart.purple.bold',
    'purple',
  )}`,
  // maxWidth: 600,
  maxWidth: '80vw',
  overflowY: 'auto',
  // TODO: remove margin before shipping
  margin: 'calc(var(--grid) * 4) auto 0 auto',
  // height: '150vh',
  height: 600,
});

function Board({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    invariant(ref.current);
    return combine(
      autoScrollForElements({
        element: ref.current,
      }),
      unsafeOverflowAutoScrollForElements({
        element: ref.current,
        getOverflow: () => ({
          fromTopEdge: {
            top: 6000,
            right: 6000,
            left: 6000,
          },
          fromRightEdge: {
            top: 6000,
            right: 6000,
            bottom: 6000,
          },
          fromBottomEdge: {
            right: 6000,
            bottom: 6000,
            left: 6000,
          },
          fromLeftEdge: {
            top: 6000,
            left: 6000,
            bottom: 6000,
          },
        }),
      }),
      autoScrollForExternal({
        element: ref.current,
      }),
    );
  }, []);
  return (
    <Fragment>
      <div ref={ref} css={scrollContainerStyles}>
        <div css={boardStyles}>{children}</div>
      </div>
      <GlobalStyles />
    </Fragment>
  );
}

export default memo(Board);
