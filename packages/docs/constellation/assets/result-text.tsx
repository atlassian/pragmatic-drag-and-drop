/** @jsx jsx */

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const stylesStyles = css({
	color: token('color.text.success', 'green'),
	fontWeight: 'bold',
});

export default function ResultText({ children }: { children: string }) {
	return <span css={stylesStyles}>{children}</span>;
}
