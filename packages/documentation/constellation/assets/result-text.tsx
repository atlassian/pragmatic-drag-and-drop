/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const stylesStyles = css({
	color: token('color.text.success', 'green'),
	fontWeight: token('font.weight.bold'),
});

export default function ResultText({ children }: { children: string }) {
	return <span css={stylesStyles}>{children}</span>;
}
