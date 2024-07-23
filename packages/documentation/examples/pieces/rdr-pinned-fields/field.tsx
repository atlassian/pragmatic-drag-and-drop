/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

const fieldContentWithIconStyles = css({
	display: 'grid',
	gridTemplateColumns: '24px 1fr',
	alignItems: 'center',
	gap: 12,
});

const fieldContentIconStyles = css({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: 24,
	height: 24,
	pointerEvents: 'none',
});

/**
 * Used to emulate a select
 */
export function FieldContentWithIcon({ children, icon }: { children: ReactNode; icon: ReactNode }) {
	return (
		<div css={fieldContentWithIconStyles}>
			<div css={fieldContentIconStyles}>{icon}</div>
			<div>{children}</div>
		</div>
	);
}
