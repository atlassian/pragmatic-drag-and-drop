/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { CSSProperties } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled
import { css, jsx } from '@emotion/react';

import { Code } from '@atlaskit/code';
import Heading from '@atlaskit/heading';
import { Box, Inline, Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import Outline from '../src/internal/outline';

const targetStyles = css({
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: token('color.border'),
	position: 'relative',
	width: '300px',
	padding: token('space.200'),
	borderRadius: 'var(--border-radius)',
});

type Options = {
	strokeColor: Parameters<typeof Outline>[0]['strokeColor'];
	indent: string;
	borderRadius: string;
};

const defaults: Options = {
	strokeColor: 'standard',
	borderRadius: token('border.radius'),
	indent: '0px',
};

function Target(options: Partial<Options>) {
	const { borderRadius, strokeColor, indent } = { ...defaults, ...options };
	return (
		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop
		<div css={targetStyles} style={{ '--border-radius': borderRadius } as CSSProperties}>
			Target
			<Outline strokeColor={strokeColor} borderRadius={borderRadius} indent={indent} />
		</div>
	);
}

function Example(options: Partial<Options>) {
	const { borderRadius, strokeColor, indent } = { ...defaults, ...options };
	return (
		<Box padding="space.200">
			<Stack space="space.100">
				<Heading size="small">
					<Inline space="space.100">
						<span>
							Color: <Code>{strokeColor}</Code>
						</span>
						<span>
							Border radius: <Code>{borderRadius}</Code>
						</span>
					</Inline>
				</Heading>
				<Target strokeColor={strokeColor} borderRadius={borderRadius} indent={indent} />
			</Stack>
		</Box>
	);
}

export default function DefaultExample() {
	return <StrokeColorStandard />;
}

export function StrokeColorStandard() {
	return <Example strokeColor="standard" />;
}

export function StrokeColorWarning() {
	return <Example strokeColor="warning" />;
}

export function CustomBorderRadius() {
	return <Example strokeColor="standard" borderRadius={token('border.radius.300')} />;
}

export function Inset() {
	return (
		<Box padding="space.100">
			<Inline space="space.200">
				{(['ltr', 'rtl'] as const).map((direction) => (
					<div>
						<Heading size="small">
							Direction <Code>{direction}</Code>
						</Heading>
						<div dir={direction}>
							<Target indent={token('space.200')} />
						</div>
					</div>
				))}
			</Inline>
		</Box>
	);
}
