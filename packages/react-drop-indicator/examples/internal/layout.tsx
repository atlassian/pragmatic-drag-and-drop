/** @jsx jsx */

import type { ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

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
