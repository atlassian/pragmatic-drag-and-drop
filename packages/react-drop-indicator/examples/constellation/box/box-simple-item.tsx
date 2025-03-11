/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const relativeStyles = css({
	position: 'relative',
});

const itemStyles = css({
	padding: token('space.100'),
	backgroundColor: token('elevation.surface'),
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: token('color.border'),
});

export function Item({
	content,
	dropIndicator,
}: {
	content: ReactNode;
	dropIndicator?: ReactNode;
}) {
	return (
		<div css={relativeStyles}>
			<div css={itemStyles}>{content}</div>
			{dropIndicator}
		</div>
	);
}
