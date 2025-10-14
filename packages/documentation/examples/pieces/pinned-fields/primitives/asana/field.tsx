/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { gapSize } from './constants';

/**
 * Used to create the visual gaps between items, without having real gaps.
 *
 * This is to avoid using stickiness, which would have different behavior
 * when the pointer leaves the list.
 */
const fieldContainerStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	padding: `${gapSize / 2}px 0px`,
	width: 'max-content',
});

const fieldStyles = css({
	boxSizing: 'border-box',
	width: 304,
	background: token('elevation.surface'),
	border: `${token('border.width')} solid ${token('color.border')}`,
	borderRadius: token('radius.large'),
	display: 'flex',
	alignItems: 'center',
	padding: token('space.100'),
	gap: token('space.100'),

	lineHeight: '24px',

	position: 'relative',
	cursor: 'grab',

	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':hover': {
		borderColor: token('color.border.bold'),
	},
});

export type FieldProps = {
	children: ReactNode;
	icon: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
	{ children, icon },
	ref,
) {
	return (
		<div ref={ref} css={fieldContainerStyles}>
			<div css={fieldStyles}>
				{icon}
				{children}
			</div>
		</div>
	);
});

const fieldPreviewStyles = css({
	borderColor: token('color.border.selected'),
	width: 'max-content',

	/**
	 * The Asana previews have a bit more vertical padding
	 */
	padding: 12,
	/**
	 * Because there is no icon the left padding increases a bit to keep the
	 * text looking centered
	 */
	paddingLeft: 16,
	/**
	 * Matches the Asana preview
	 */
	paddingRight: 48,
});

export function FieldPreview({ children }: { children: ReactNode }) {
	return <div css={[fieldStyles, fieldPreviewStyles]}>{children}</div>;
}
