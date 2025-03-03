/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled
import { jsx } from '@emotion/react';

import { Code } from '@atlaskit/code';
import Heading from '@atlaskit/heading';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { Box, Inline, Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import Line from '../src/internal/line';

import { List, Orientation } from './internal/list';

type Appearance = Exclude<Parameters<typeof Line>[0]['appearance'], undefined>;

const orientationFromEdge: { [TKey in Edge]: Orientation } = {
	top: 'vertical',
	right: 'horizontal',
	bottom: 'vertical',
	left: 'horizontal',
};

function Example({
	appearance,
	gap,
	edge,
	strokeColor,
	indent,
}: {
	appearance: Appearance;
	edge: Edge;
	gap: string;
	strokeColor?: Parameters<typeof Line>[0]['strokeColor'];
	indent?: string;
}) {
	return (
		<Box padding="space.100">
			<Stack space="space.100">
				<Heading size="small">
					<Inline space="space.100">
						<span>
							Edge: <Code>{edge}</Code>
						</span>
						<span>
							Appearance: <Code>{appearance}</Code>
						</span>
						<span>
							Gap: <Code>{gap}</Code>
						</span>
						{strokeColor ? (
							<span>
								Color: <Code>{strokeColor}</Code>
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
											appearance={appearance}
											gap={gap}
											strokeColor={strokeColor}
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
	);
}

export default function DefaultExample() {
	return <Example edge="bottom" gap="0px" appearance="terminal" />;
}

/**
 * **Exporting Combinations**
 *
 * Manually exporting each combination as our VR tester does not
 * work well when passing dynamic arguments.
 *
 * Naming convention: `Edge${edge}Appearance${appearance}Gap${gap}`
 */

export function EdgeTopAppearanceTerminalGap0px() {
	return <Example edge="top" appearance="terminal" gap="0px" />;
}

export function EdgeRightAppearanceTerminalGap0px() {
	return <Example edge="right" appearance="terminal" gap="0px" />;
}

export function EdgeBottomAppearanceTerminalGap0px() {
	return <Example edge="bottom" appearance="terminal" gap="0px" />;
}

export function EdgeLeftAppearanceTerminalGap0px() {
	return <Example edge="left" appearance="terminal" gap="0px" />;
}

export function EdgeTopAppearanceTerminalGapTokenSpace100() {
	return <Example edge="top" appearance="terminal" gap={token('space.100')} />;
}

export function EdgeRightAppearanceTerminalGapTokenSpace100() {
	return <Example edge="right" appearance="terminal" gap={token('space.100')} />;
}

export function EdgeBottomAppearanceTerminalGapTokenSpace100() {
	return <Example edge="bottom" appearance="terminal" gap={token('space.100')} />;
}

export function EdgeLeftAppearanceTerminalGapTokenSpace100() {
	return <Example edge="left" appearance="terminal" gap={token('space.100')} />;
}

export function EdgeTopAppearanceNoTerminalGap0px() {
	return <Example edge="top" appearance="no-terminal" gap="0px" />;
}

export function EdgeRightAppearanceNoTerminalGap0px() {
	return <Example edge="right" appearance="no-terminal" gap="0px" />;
}

export function EdgeBottomAppearanceNoTerminalGap0px() {
	return <Example edge="bottom" appearance="no-terminal" gap="0px" />;
}

export function EdgeLeftAppearanceNoTerminalGap0px() {
	return <Example edge="left" appearance="no-terminal" gap="0px" />;
}

export function EdgeTopAppearanceNoTerminalGapTokenSpace100() {
	return <Example edge="top" appearance="no-terminal" gap={token('space.100')} />;
}

export function EdgeRightAppearanceNoTerminalGapTokenSpace100() {
	return <Example edge="right" appearance="no-terminal" gap={token('space.100')} />;
}

export function EdgeBottomAppearanceNoTerminalGapTokenSpace100() {
	return <Example edge="bottom" appearance="no-terminal" gap={token('space.100')} />;
}

export function EdgeLeftAppearanceNoTerminalGapTokenSpace100() {
	return <Example edge="left" appearance="no-terminal" gap={token('space.100')} />;
}

export function EdgeTopAppearanceTerminalNoBleedGap0px() {
	return <Example edge="top" appearance="terminal-no-bleed" gap="0px" />;
}

export function EdgeRightAppearanceTerminalNoBleedGap0px() {
	return <Example edge="right" appearance="terminal-no-bleed" gap="0px" />;
}

export function EdgeBottomAppearanceTerminalNoBleedGap0px() {
	return <Example edge="bottom" appearance="terminal-no-bleed" gap="0px" />;
}

export function EdgeLeftAppearanceTerminalNoBleedGap0px() {
	return <Example edge="left" appearance="terminal-no-bleed" gap="0px" />;
}

export function EdgeTopAppearanceTerminalNoBleedGapTokenSpace100() {
	return <Example edge="top" appearance="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeRightAppearanceTerminalNoBleedGapTokenSpace100() {
	return <Example edge="right" appearance="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeBottomAppearanceTerminalNoBleedGapTokenSpace100() {
	return <Example edge="bottom" appearance="terminal-no-bleed" gap={token('space.100')} />;
}

export function EdgeLeftAppearanceTerminalNoBleedGapTokenSpace100() {
	return <Example edge="left" appearance="terminal-no-bleed" gap={token('space.100')} />;
}

/**
 * **Indenting**
 *
 * It is possible to _indent_ the line. This is helpful in situations where you need to
 * be able to shift the line horizontally (eg in trees).
 *
 */
export function EdgeTopAppearanceTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example
			edge="top"
			appearance="terminal"
			gap={token('space.100')}
			indent={token('space.200')}
		/>
	);
}
export function EdgeRightAppearanceTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example
			edge="right"
			appearance="terminal"
			gap={token('space.100')}
			indent={token('space.200')}
		/>
	);
}
export function EdgeBottomAppearanceTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example
			edge="bottom"
			appearance="terminal"
			gap={token('space.100')}
			indent={token('space.200')}
		/>
	);
}
export function EdgeLeftAppearanceTerminalNoBleedGapTokenSpace100IndentTokenSpace200() {
	return (
		<Example
			edge="left"
			appearance="terminal"
			gap={token('space.100')}
			indent={token('space.200')}
		/>
	);
}

/**
 * **Color variants**
 *
 * Only running a subset of cases with a separate color to prevent combinatorial explosion
 */

export function ColorWarning() {
	return (
		<Example edge="bottom" appearance="terminal" gap={token('space.100')} strokeColor="warning" />
	);
}

export function ColorDiscovery() {
	return (
		<Example
			edge="bottom"
			appearance="terminal"
			gap={token('space.100')}
			strokeColor={token('color.border.discovery')}
		/>
	);
}
