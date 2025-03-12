/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

const relativeStyles = css({
	position: 'relative',
});

const itemStyles = css({
	paddingTop: token('space.100'),
	paddingRight: token('space.100'),
	paddingBottom: token('space.100'),
	paddingLeft: token('space.100'),
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
