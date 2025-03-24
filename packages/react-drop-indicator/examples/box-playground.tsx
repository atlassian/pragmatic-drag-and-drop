/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import React from 'react';

import { css, jsx } from '@compiled/react';

import { Stack } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import { AppearanceExample } from './constellation/box/box-appearance';
import { EdgeExample } from './constellation/box/box-edge';
import { GapExample } from './constellation/box/box-gap';
import { IndentExample } from './constellation/box/box-indent';
import { OverlapExample } from './constellation/box/box-overlap';
import { TypeExample } from './constellation/box/box-type';

const containerStyles = css({
	maxWidth: '710px',
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: token('color.border'),
	paddingTop: token('space.200'),
	paddingRight: token('space.200'),
	paddingBottom: token('space.200'),
	paddingLeft: token('space.200'),
});

export default function AllExamples() {
	return (
		<React.StrictMode>
			<div css={containerStyles}>
				<Stack space="space.400">
					<EdgeExample />
					<TypeExample />
					<AppearanceExample />
					<GapExample />
					<OverlapExample />
					<IndentExample />
				</Stack>
			</div>
		</React.StrictMode>
	);
}
