/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { css, jsx } from '@compiled/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { token } from '@atlaskit/tokens';

import { Item } from '../simple-item';

const layoutStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: token('space.200'),
	maxWidth: '300px',
});

export function AppearanceExample(): JSX.Element {
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
