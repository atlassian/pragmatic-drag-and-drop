/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { useEffect, useState } from 'react';

import { css, jsx } from '@compiled/react';

import { Stack, Text } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../../src/box';

const outerStyles = css({
	position: 'relative',
	borderWidth: token('border.width'),
	borderStyle: 'dotted',
	borderColor: token('color.border.discovery'),
	minHeight: token('space.400'),
});

const maxLevels = 6;
const indentPerLevel = token('space.500');

export function IndentExample() {
	const [level, setLevel] = useState<number>(0);

	// A little animation to show off the line shifting between points
	useEffect(() => {
		// Not showing animation if the user prefers reduced motion
		const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReduceMotion) {
			return;
		}

		const timerId = window.setInterval(() => {
			setLevel((current) => (current + 1) % (maxLevels + 1));
		}, 1000);

		return () => window.clearInterval(timerId);
	}, []);

	return (
		<Stack space="space.050">
			<Text color="color.text.discovery">Full width element</Text>
			<div css={outerStyles}>
				<DropIndicator
					type="terminal"
					edge="bottom"
					indent={`calc(${level} * ${indentPerLevel})`}
				/>
			</div>
		</Stack>
	);
}
