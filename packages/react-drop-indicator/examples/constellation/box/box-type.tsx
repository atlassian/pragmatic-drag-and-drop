/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { css, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../../src/box';
import { Item } from '../simple-item';

const layoutStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: token('space.200'),
	maxWidth: '300px',
});

export function TypeExample() {
	return (
		<div css={layoutStyles}>
			<Item
				content="terminal (default)"
				dropIndicator={<DropIndicator type="terminal" edge="bottom" />}
			/>
			<Item
				content="terminal-no-bleed"
				dropIndicator={<DropIndicator type="terminal-no-bleed" edge="bottom" />}
			/>
			<Item
				content="no-terminal"
				dropIndicator={<DropIndicator type="no-terminal" edge="bottom" />}
			/>
		</div>
	);
}
