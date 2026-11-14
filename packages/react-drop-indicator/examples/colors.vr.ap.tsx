/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import type { JSX } from 'react';

import { css, cssMap, jsx } from '@compiled/react';

import { Inline } from '@atlaskit/primitives/compiled/inline';
import { Stack } from '@atlaskit/primitives/compiled/stack';
import { token } from '@atlaskit/tokens';

import { DropIndicator as Border } from '../src/border';
import { DropIndicator as Box } from '../src/box';
import { GroupDropIndicator } from '../src/group';
import { DropIndicator as ListItem } from '../src/list-item';
import { DropIndicator as TreeItem } from '../src/tree-item';
import type { Colors } from '../src/types';

const styles = cssMap({
	root: {
		width: '720px',
		paddingBlockStart: token('space.300'),
		paddingBlockEnd: token('space.300'),
		paddingInlineStart: token('space.300'),
		paddingInlineEnd: token('space.300'),
		backgroundColor: token('elevation.surface'),
		color: token('color.text'),
	},
	column: {
		flex: 1,
	},
	target: {
		position: 'relative',
		paddingBlockStart: token('space.150'),
		paddingBlockEnd: token('space.150'),
		paddingInlineStart: token('space.150'),
		paddingInlineEnd: token('space.150'),
	},
});

// Provide equivalent custom theme overrides for both color schemes.
const customThemeStyles = css({
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Exercises a compatible custom warning override.
	'--ds-border-warning': token('color.border.accent.red'),
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Exercises the matching dedicated warning role.
	'--ds-border-dropindicator-warning': token('color.border.accent.red'),
	// A compatible custom theme provides both legacy and migrated roles.
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Deliberately exercises the legacy role override used by themed consumers.
	'--ds-border-selected': token('color.border.accent.purple'),
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Exercises the dedicated role for consumers opting into dedicated colors.
	'--ds-border-dropindicator': token('color.border.accent.purple'),
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Deliberately exercises the legacy group background override.
	'--ds-background-information': token('color.background.accent.purple.subtlest'),
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage -- Verifies a compatible active-destination background override.
	'--ds-background-droptarget': token('color.background.accent.purple.subtlest'),
});

function Indicators({ colors }: { colors: Colors }): JSX.Element {
	return (
		<div css={styles.column}>
			<Stack space="space.300">
				<strong>{colors}</strong>
				<div css={styles.target}>
					Insertion line and terminal
					<Box colors={colors} edge="bottom" />
				</div>
				<div css={styles.target}>
					Blocked insertion
					<Box colors={colors} edge="bottom" appearance="warning" />
				</div>
				<div css={styles.target}>
					Accepting outline
					<Border colors={colors} />
				</div>
				<div css={styles.target}>
					Blocked list combine
					<ListItem
						colors={colors}
						instruction={{ operation: 'combine', axis: 'vertical', blocked: true }}
					/>
				</div>
				<div css={styles.target}>
					Tree insertion
					<TreeItem
						colors={colors}
						instruction={{ type: 'reorder-below', currentLevel: 1, indentPerLevel: 16 }}
					/>
				</div>
				<GroupDropIndicator colors={colors} isActive>
					<div css={styles.target}>
						Insertion over an active destination
						<Box colors={colors} edge="bottom" />
					</div>
				</GroupDropIndicator>
				<GroupDropIndicator colors={colors} isActive={false}>
					<div css={styles.target}>Inactive group</div>
				</GroupDropIndicator>
			</Stack>
		</div>
	);
}

function Example({ customTheme = false }: { customTheme?: boolean }): JSX.Element {
	return (
		<div css={[styles.root, customTheme && customThemeStyles]}>
			<Inline space="space.400" alignBlock="start">
				<Indicators colors="standard" />
				<Indicators colors="dedicated" />
			</Inline>
		</div>
	);
}

export default function ColorsExample(): JSX.Element {
	return <Example />;
}

export function CustomTheme(): JSX.Element {
	return <Example customTheme />;
}
