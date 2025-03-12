/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

const layoutStyles = css({
	display: 'flex',
	padding: 32,
	gap: 32,
	flexWrap: 'wrap',
});

const Layout = ({ children, testId }: { children: ReactNode; testId?: string }) => {
	return (
		<div css={layoutStyles} data-testid={testId}>
			{children}
		</div>
	);
};

export default Layout;
