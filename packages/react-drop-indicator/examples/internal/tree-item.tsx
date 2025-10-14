/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { CSSProperties } from 'react';

import { css, jsx } from '@compiled/react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../src/tree-item';

const itemStyles = css({
	display: 'flex',
	minWidth: 120,
	padding: 8,
	alignItems: 'center',
	gap: 4,
	borderRadius: 3,
	position: 'relative',
	paddingInlineStart: 'calc(var(--horizontal-indent) + 1ch)',
	backgroundColor: token('elevation.surface.sunken'),
});

function getLabel(instruction: Instruction): string {
	if (instruction.type === 'instruction-blocked') {
		return `[Blocked] ${getLabel(instruction.desired)}`;
	}
	if (instruction.type === 'reparent') {
		return `reparent (lvl${instruction.currentLevel} -> lvl${instruction.desiredLevel})`;
	}
	return instruction.type;
}

export default function TreeItem({
	instruction,
	indentPerLevel,
	currentLevel,
}: {
	instruction: Instruction;
	indentPerLevel: number;
	currentLevel: number;
}) {
	return (
		<div
			css={itemStyles}
			style={
				{
					'--horizontal-indent': `${indentPerLevel * currentLevel}px`,
				} as CSSProperties
			}
		>
			<span>Instruction: </span>
			{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
			<code>
				<small>{getLabel(instruction)}</small>
			</code>
			<DropIndicator instruction={instruction} />
		</div>
	);
}
