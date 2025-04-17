/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { CSSProperties } from 'react';

import { css, jsx } from '@compiled/react';

import type { CSSColor, CSSSize } from '../internal-types';
import { presetStrokeColors, presetStrokeWidth } from '../presets';

const styles = css({
	// To make things a bit clearer we are making the box that the indicator in as
	// big as the whole tree item
	position: 'absolute',
	insetBlockStart: 0,
	insetBlockEnd: 0,
	insetInlineEnd: 0,
	insetInlineStart: 'var(--indent)',

	// We don't want to cause any additional 'dragenter' events
	pointerEvents: 'none',

	border: 'var(--stroke-width) solid var(--stroke-color)',
	borderRadius: 'var(--border-radius)',
});

export function Border({
	strokeColor = presetStrokeColors.default,
	strokeWidth = presetStrokeWidth,
	borderRadius = '3px', // TODO: update to border.radius (4px) token
	indent = '0px',
}: {
	strokeColor?: CSSColor;
	borderRadius?: CSSSize;
	strokeWidth?: CSSSize;
	indent?: string;
}) {
	return (
		<div
			style={
				{
					'--stroke-color': strokeColor,
					'--stroke-width': strokeWidth,
					'--border-radius': borderRadius,
					'--indent': indent,
				} as CSSProperties
			}
			css={styles}
		/>
	);
}

// For React.lazy
export default Border;
