/** @jsx jsx */

import { forwardRef, memo, type ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import { gridSize } from '../../util/constants';

type BoardProps = {
  children: ReactNode;
};

const boardStyles = css({
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  flexDirection: 'row',
  '--grid': `${gridSize}px`,
  height: 480,
});

const Board = forwardRef<HTMLDivElement, BoardProps>(
  ({ children }: BoardProps, ref) => {
    return (
      <div css={boardStyles} ref={ref}>
        {children}
      </div>
    );
  },
);

export default memo(Board);
