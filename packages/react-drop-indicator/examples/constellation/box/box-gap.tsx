/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { Code } from '@atlaskit/code';
import Heading from '@atlaskit/heading';
import { Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../../src/box';

import { Item } from './box-simple-item';

const verticalStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: token('space.200'),
	maxWidth: '300px',
});

const horizontalStyles = css({
	display: 'flex',
	flexDirection: 'row',
	gap: token('space.400'),
	alignItems: 'center',
});

export function GapExample() {
	return (
		<Stack space="space.400">
			<Stack space="space.100">
				<Heading size="small">Vertical list</Heading>
				<Text>
					Gap: <Code>token('space.200')</Code>
				</Text>
				<div css={verticalStyles}>
					<Item
						content="item A"
						dropIndicator={<DropIndicator type="terminal" edge="bottom" gap={token('space.200')} />}
					/>
					<Item
						content="item B"
						dropIndicator={<DropIndicator type="terminal" edge="bottom" gap={token('space.200')} />}
					/>
					<Item content="item C" />
				</div>
			</Stack>
			<Stack space="space.100">
				<Heading size="small">Horizontal list</Heading>
				<Text>
					Gap: <Code>token('space.400')</Code>
				</Text>
				<div css={horizontalStyles}>
					<Item
						content="item A"
						dropIndicator={
							<DropIndicator type="terminal" edge={'right'} gap={token('space.400')} />
						}
					/>
					<Item
						content="item B"
						dropIndicator={
							<DropIndicator type="terminal" edge={'right'} gap={token('space.400')} />
						}
					/>
					<Item content="item C" />
				</div>
			</Stack>
		</Stack>
	);
}
