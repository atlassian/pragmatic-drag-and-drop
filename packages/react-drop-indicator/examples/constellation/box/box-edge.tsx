/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { css, jsx } from '@compiled/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { token } from '@atlaskit/tokens';

import { Item } from '../simple-item';

const layoutStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 1fr)',
	gap: token('space.200'),
});

export function EdgeExample(): JSX.Element {
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
