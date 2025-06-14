/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import React from 'react';

import { jsx } from '@compiled/react';

import { Code } from '@atlaskit/code';
import Heading from '@atlaskit/heading';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { Box, Inline, Stack, Text } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import type { Appearance } from '../src/internal-types';
import Line from '../src/internal/line';
import { presetStrokeColors } from '../src/presets';

import { List, type Orientation } from './internal/list';

const orientationFromEdge: { [TKey in Edge]: Orientation } = {
	top: 'vertical',
	right: 'horizontal',
	bottom: 'vertical',
	left: 'horizontal',
};

function Example({
	type,
	gap,
	edge,
	appearance,
	indent,
}: {
	type: Exclude<Parameters<typeof Line>[0]['type'], undefined>;
	edge: Edge;
	gap: string;
	// Adding "custom" to poke at the increased color range of Outline (which it has for now)
	appearance?: Appearance | { custom: string };
	indent?: string;
}) {
	return (
		<React.StrictMode>
			<Box padding="space.100">
				<Stack space="space.100">
					<Heading size="small">
						<Inline space="space.100">
							<span>
								Edge: <Code>{edge}</Code>
							</span>
							<span>
								Type: <Code>{type}</Code>
							</span>
							<span>
								Gap: <Code>{gap}</Code>
							</span>
							{typeof appearance === 'string' ? (
								<span>
									Appearance: <Code>{appearance}</Code>
								</span>
							) : null}
							{typeof appearance === 'object' && appearance.custom ? (
								<span>
									Custom color: <Code>{appearance.custom}</Code>
								</span>
							) : null}
							{indent ? (
								<span>
									Indent: <Code>{indent}</Code>
								</span>
							) : null}
						</Inline>
					</Heading>
					<Inline space="space.100">
						{(['ltr', 'rtl'] as const).map((direction) => (
							<Stack space="space.100" key={direction}>
								<Text>
									Direction: <Code>{direction}</Code>
								</Text>
								<div dir={direction}>
									<List
										orientation={orientationFromEdge[edge]}
										gap={gap}
										indicator={
											<Line
												edge={edge}
												type={type}
												gap={gap}
												strokeColor={
													typeof appearance === 'string'
														? presetStrokeColors[appearance]
														: appearance?.custom
												}
												indent={indent}
											/>
										}
									/>
								</div>
							</Stack>
						))}
					</Inline>
				</Stack>
			</Box>
		</React.StrictMode>
	);
}

export default function DefaultExample() {
	return <Example edge="bottom" gap="0px" type="terminal" />;
}

/**
 * **Exporting Combinations**
 *
 * Manually exporting each combination as our VR tester does not
 * work well when passing dynamic arguments.
 *
 * Naming convention: `Edge${edge}Type${type}Gap${gap}`
 */

export function EdgeTopTypeTerminalGap0px() {
	return <Example edge="top" type="terminal" gap="0px" />;
}

export function EdgeRightTypeTerminalGap0px() {
	return <Example edge="right" type="terminal" gap="0px" />;
}

export function EdgeBottomTypeTerminalGap0px() {
	return <Example edge="bottom" type="terminal" gap="0px" />;
}

export function EdgeLeftTypeTerminalGap0px() {
	return <Example edge="left" type="terminal" gap="0px" />;
}

export function EdgeTopTypeTerminalGapTokenSpace100() {
	return <Example edge="top" type="terminal" gap={token('space.100')} />;
}

export function EdgeRightTypeTerminalGapTokenSpace100() {
	return <Example edge="right" type="terminal" gap={token('space.100')} />;
}

export function EdgeBottomTypeTerminalGapTokenSpace100() {
	return <Example edge="bottom" type="terminal" gap={token('space.100')} />;
}

export function EdgeLeftTypeTerminalGapTokenSpace100() {
	return <Example edge="left" type="terminal" gap={token('space.100')} />;
}

export function EdgeTopTypeNoTerminalGap0px() {
	return <Example edge="top" type="no-terminal" gap="0px" />;
}

export function EdgeRightTypeNoTerminalGap0px() {
	return <Example edge="right" type="no-terminal" gap="0px" />;
}

export function EdgeBottomTypeNoTerminalGap0px() {
	return <Example edge="bottom" type="no-terminal" gap="0px" />;
}

export function EdgeLeftTypeNoTerminalGap0px() {
	return <Example edge="left" type="no-terminal" gap="0px" />;
}

export function EdgeTopTypeNoTerminalGapTokenSpace100() {
	return <Example edge="top" type="no-terminal" gap={token('space.100')} />;
}

export function EdgeRightTypeNoTerminalGapTokenSpace100() {
	return <Example edge="right" type="no-terminal" gap={token('space.100')} />;
}

export function EdgeBottomTypeNoTerminalGapTokenSpace100() {
	return <Example edge="bottom" type="no-terminal" gap={token('space.100')} />;
}

export function EdgeLeftTypeNoTerminalGapTokenSpace100() {
	return <Example edge="left" type="no-terminal" gap={token('space.100')} />;
}

export function EdgeTopTypeTerminalNoBleedGap0px() {
	return <Example edge="top" type="terminal-no-bleed" gap="0px" />;
}

export function EdgeRightTypeTerminalNoBleedGap0px() {
	return <Example edge="right" type="terminal-no-bleed" gap="0px" />;
}

export function EdgeBottomTypeTerminalNoBleedGap0px() {
	return <Example edge="bottom" type="terminal-no-bleed" gap="0px" />;
}

export function EdgeLeftTypeTerminalNoBleedGap0px() {
	return <Example edge="left" type="terminal-no-bleed" gap="0px" />;
}

export function EdgeTopTypeTerminalNoBleedGapTokenSpace100() {
	return <Example edge="top" type="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeRightTypeTerminalNoBleedGapTokenSpace100() {
	return <Example edge="right" type="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeBottomTypeTerminalNoBleedGapTokenSpace100() {
	return <Example edge="bottom" type="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeLeftTypeTerminalNoBleedGapTokenSpace100() {
	return <Example edge="left" type="terminal-no-bleed" gap={token('space.100')} />;
}

/**
 * **Indenting**
 *
 * It is possible to _indent_ the line. This is helpful in situations where you need to
 * be able to shift the line horizontally (eg in trees).
 *
 */
export function EdgeTopTypeTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example edge="top" type="terminal" gap={token('space.100')} indent={token('space.200')} />
	);
}
export function EdgeRightTypeTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example edge="right" type="terminal" gap={token('space.100')} indent={token('space.200')} />
	);
}
export function EdgeBottomTypeTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example edge="bottom" type="terminal" gap={token('space.100')} indent={token('space.200')} />
	);
}
export function EdgeLeftTypeTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example edge="left" type="terminal" gap={token('space.100')} indent={token('space.200')} />
	);
}

/**
 * **Color variants**
 *
 * Only running a subset of cases with a separate color to prevent combinatorial explosion
 */

export function ColorWarning() {
	return <Example edge="bottom" type="terminal" gap={token('space.100')} appearance="warning" />;
}

export function ColorDiscovery() {
	return (
		<Example
			edge="bottom"
			type="terminal"
			gap={token('space.100')}
			appearance={{ custom: token('color.border.discovery') }}
		/>
	);
}
