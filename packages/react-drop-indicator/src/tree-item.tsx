import React, { type ReactElement } from 'react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';

import { DropIndicator as Border } from './border';
import { DropIndicator as Line } from './box';
import type { Colors } from './types';

export type DropIndicatorProps = {
	instruction: Instruction;
	/** Token roles to use. Defaults to `standard`. */
	colors?: Colors;
};

function getElement({
	instruction,
	isBlocked,
	colors,
}: {
	instruction: Exclude<Instruction, { type: 'instruction-blocked' }>;
	isBlocked: boolean;
	colors: Colors;
}): ReactElement | null {
	const indent = `${instruction.currentLevel * instruction.indentPerLevel}px`;
	const appearance = isBlocked ? 'warning' : 'default';

	if (instruction.type === 'reorder-above') {
		return <Line edge="top" appearance={appearance} colors={colors} indent={indent} />;
	}
	if (instruction.type === 'reorder-below') {
		return <Line edge="bottom" appearance={appearance} colors={colors} indent={indent} />;
	}

	if (instruction.type === 'make-child') {
		return <Border appearance={appearance} colors={colors} indent={indent} />;
	}

	if (instruction.type === 'reparent') {
		const reparentIndent = `${instruction.desiredLevel * instruction.indentPerLevel}px`;
		return <Line edge="bottom" appearance={appearance} colors={colors} indent={reparentIndent} />;
	}

	return null;
}

export function DropIndicator({
	instruction,
	colors = 'standard',
}: DropIndicatorProps): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null {
	if (instruction.type === 'instruction-blocked') {
		return getElement({ instruction: instruction.desired, isBlocked: true, colors });
	}
	return getElement({ instruction, isBlocked: false, colors });
}
