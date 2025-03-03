/* eslint-disable @atlaskit/design-system/ensure-design-token-usage/preview */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { CSSProperties } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import type { CSSSize, StrokeColor, StrokeWidth } from '../internal-types';
import { presetStrokeColors, presetStrokeSizes } from '../presets';

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

	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	border: 'var(--stroke-width) solid var(--stroke-color)',
	borderRadius: 'var(--border-radius)',
});

// TODO: use `outline` or `border`?
export function Outline({
	strokeColor = 'standard',
	strokeWidth = 'standard',
	borderRadius = '3px', // TODO: update to border.radius (4px) token
	indent = '0px',
}: {
	strokeColor?: StrokeColor;
	borderRadius?: CSSSize;
	strokeWidth?: StrokeWidth;
	indent?: string;
}) {
	// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop
	return (
		<div
			style={
				{
					'--stroke-color': presetStrokeColors[strokeColor] ?? strokeColor,
					'--stroke-width': presetStrokeSizes[strokeWidth] ?? strokeWidth,
					'--border-radius': borderRadius,
					'--indent': indent,
				} as CSSProperties
			}
			css={styles}
		/>
	);
}

// For React.lazy
export default Outline;
