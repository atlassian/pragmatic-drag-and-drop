/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { css, jsx } from '@compiled/react';

import { Code } from '@atlaskit/code';
import ArrowLeftIcon from '@atlaskit/icon/core/arrow-left';
import { Inline, Text } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../../src/box';
import { Item } from '../simple-item';

const containerStyles = css({
	display: 'flex',
	flexDirection: 'row',
	gap: token('space.200'),
	alignItems: 'center',
});

const listStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: token('space.200'),
	width: '300px',
	flexShrink: 0,
});

const appTileStyles = css({
	backgroundColor: token('color.background.success.bold'),
	width: token('space.300'),
	height: token('space.300'),
	flexShrink: 0,
	boxSizing: 'border-box',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	borderRadius: token('border.radius'),
});

export function OverlapExample() {
	return (
		<div css={containerStyles}>
			<div css={listStyles}>
				<Item
					content={
						<Text>
							item A (<Code>edge: bottom</Code>)
						</Text>
					}
					dropIndicator={<DropIndicator type="terminal" edge="bottom" gap={token('space.200')} />}
				/>
				<Item
					content={
						<Text>
							item B (<Code>edge: top</Code>)
						</Text>
					}
					dropIndicator={<DropIndicator type="terminal" edge="top" gap={token('space.200')} />}
				/>
			</div>
			<div>
				<Inline space="space.200" alignBlock="center">
					<div css={appTileStyles}>
						<ArrowLeftIcon label="" spacing="none" color={token('color.icon.inverse')} />
					</div>
					<Text>
						The <Code>bottom</Code> edge for <em>item A</em> is rendered in the same visual position
						as the
						<Code>top</Code> edge for <em>item B</em>.
					</Text>
				</Inline>
			</div>
		</div>
	);
}
