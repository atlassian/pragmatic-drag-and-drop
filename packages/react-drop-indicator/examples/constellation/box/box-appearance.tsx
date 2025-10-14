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

export function AppearanceExample() {
	return (
		<div css={layoutStyles}>
			<Item
				content="default"
				dropIndicator={<DropIndicator type="terminal" edge="top" appearance="default" />}
			/>
			<Item
				content="warning"
				dropIndicator={<DropIndicator type="terminal" edge="top" appearance="warning" />}
			/>
		</div>
	);
}
