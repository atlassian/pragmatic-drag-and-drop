/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { forwardRef, memo, type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

type BoardProps = {
	children: ReactNode;
};

const boardStyles = css({
	display: 'flex',
	justifyContent: 'center',
	gap: 8,
	flexDirection: 'row',
	'--grid': token('space.100'),
	height: 480,
});

const Board = forwardRef<HTMLDivElement, BoardProps>(({ children }: BoardProps, ref) => {
	return (
		<div css={boardStyles} ref={ref}>
			{children}
		</div>
	);
});

export default memo(Board);
