/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../../src/box';

import { Item } from './box-simple-item';

const layoutStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 1fr)',
	gap: token('space.200'),
});

export function EdgeExample() {
	return (
		<div css={layoutStyles}>
			{(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
				<Item
					key={edge}
					content={edge}
					dropIndicator={<DropIndicator type="terminal" edge={edge} />}
				/>
			))}
		</div>
	);
}
