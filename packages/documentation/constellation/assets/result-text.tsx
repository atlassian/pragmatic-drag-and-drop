/**
 * @jsxRuntime classic
 * @jsx jsx
 */

/* eslint-disable @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766 */
// oxlint-disable-next-line typescript-eslint/consistent-type-imports
import { css, jsx } from '@emotion/react';
/* eslint-enable @atlaskit/ui-styling-standard/use-compiled */

import { token } from '@atlaskit/tokens';

const stylesStyles = css({
	color: token('color.text.success'),
	fontWeight: token('font.weight.bold'),
});

export default function ResultText({ children }: { children: string }): jsx.JSX.Element {
	return <span css={stylesStyles}>{children}</span>;
}
