/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../src/box';

const itemGap = 16;

const containerStyles = css({
	display: 'flex',
	gap: itemGap,
});

const dropTargetStyles = css({
	position: 'relative',
	display: 'inline-block',
	border: `1px solid ${token('color.border', 'lightgrey')}`,
});

export default function GapExample() {
	return (
		<div css={containerStyles}>
			<div css={dropTargetStyles}>
				<span>Drop target</span>
				<DropIndicator edge="right" gap={`${itemGap}px`} />
			</div>
			<div css={dropTargetStyles}>
				<span>Drop target</span>
			</div>
		</div>
	);
}
