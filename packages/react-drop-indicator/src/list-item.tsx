import React, { type ComponentProps, type ReactNode } from 'react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
// exporting the type for consumption ease
export {
	type Instruction,
	type Operation,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';

import { DropIndicator as Border } from './border';
import { DropIndicator as Line } from './box';

const axisLookup = {
	vertical: {
		start: 'top',
		end: 'bottom',
	},
	horizontal: {
		start: 'left',
		end: 'right',
	},
} as const;

type LineProps = ComponentProps<typeof Line>;

export function DropIndicator({
	instruction,
	lineGap,
	lineType,
}: {
	instruction: Instruction;
	lineGap?: LineProps['gap'];
	lineType?: LineProps['type'];
}): ReactNode {
	const appearance = instruction.blocked ? 'warning' : 'default';
	const axis = axisLookup[instruction.axis];

	if (instruction.operation === 'combine') {
		return <Border appearance={appearance} />;
	}

	if (instruction.operation === 'reorder-before') {
		return <Line edge={axis.start} appearance={appearance} gap={lineGap} type={lineType} />;
	}
	if (instruction.operation === 'reorder-after') {
		return <Line edge={axis.end} appearance={appearance} gap={lineGap} type={lineType} />;
	}

	return null;
}
