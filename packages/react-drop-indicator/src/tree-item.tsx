import React, { type ReactElement } from 'react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';

import { Line } from './internal/line';
import { Outline } from './internal/outline';
import { presetStrokeColors } from './presets';

export type DropIndicatorProps = {
	instruction: Instruction;
};

function getElement({
	instruction,
	isBlocked,
}: {
	instruction: Exclude<Instruction, { type: 'instruction-blocked' }>;
	isBlocked: boolean;
}): ReactElement | null {
	const indent = `${instruction.currentLevel * instruction.indentPerLevel}px`;
	const strokeColor = presetStrokeColors[!isBlocked ? 'default' : 'warning'];

	if (instruction.type === 'reorder-above') {
		return <Line edge="top" strokeColor={strokeColor} indent={indent} />;
	}
	if (instruction.type === 'reorder-below') {
		return <Line edge="bottom" strokeColor={strokeColor} indent={indent} />;
	}

	if (instruction.type === 'make-child') {
		return <Outline strokeColor={strokeColor} indent={indent} />;
	}

	if (instruction.type === 'reparent') {
		const reparentIndent = `${instruction.desiredLevel * instruction.indentPerLevel}px`;
		return <Line edge="bottom" strokeColor={strokeColor} indent={reparentIndent} />;
	}

	return null;
}

export function DropIndicator({ instruction }: DropIndicatorProps) {
	if (instruction.type === 'instruction-blocked') {
		return getElement({ instruction: instruction.desired, isBlocked: true });
	}
	return getElement({ instruction, isBlocked: false });
}
