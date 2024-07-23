/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { token } from '@atlaskit/tokens';

import { gapSize } from './constants';

const terminalRadius = 6;
const lineThickness = 2;

const dropIndicatorStyles = css({
	position: 'absolute',
	left: 0,
	width: '100%',
	height: lineThickness,
	background: token('color.border.selected'),

	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::before': {
		content: '""',
		width: terminalRadius * 2,
		height: terminalRadius * 2,
		background: token('color.border.selected'),
		position: 'absolute',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		left: -terminalRadius * 2,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		top: -terminalRadius + lineThickness / 2,
		borderRadius: '50%',
	},
});

const dropIndicatorEdgeStyles = {
	top: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
		top: -(gapSize / 2 + lineThickness),
	}),
	bottom: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
		bottom: -(gapSize / 2 + lineThickness),
	}),
	left: {},
	right: {},
};

export function DropIndicator({ edge }: { edge: Edge }) {
	return <div css={[dropIndicatorStyles, dropIndicatorEdgeStyles[edge]]} />;
}
