import React, { type ComponentProps, type ReactNode } from 'react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
// exporting the type for consumption ease
export {
	type Instruction,
	type Operation,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';

import { DropIndicator as Border } from './border';
import { DropIndicator as Line } from './box';
import type { Colors } from './types';

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
	colors = 'standard',
	lineGap,
	lineType,
}: {
	instruction: Instruction;
	/** Token roles to use. Defaults to `standard`. */
	colors?: Colors;
	lineGap?: LineProps['gap'];
	lineType?: LineProps['type'];
}): ReactNode {
	const appearance = instruction.blocked ? 'warning' : 'default';
	const axis = axisLookup[instruction.axis];

	if (instruction.operation === 'combine') {
		return <Border appearance={appearance} colors={colors} />;
	}

	if (instruction.operation === 'reorder-before') {
		return (
			<Line
				edge={axis.start}
				appearance={appearance}
				colors={colors}
				gap={lineGap}
				type={lineType}
			/>
		);
	}
	if (instruction.operation === 'reorder-after') {
		return (
			<Line edge={axis.end} appearance={appearance} colors={colors} gap={lineGap} type={lineType} />
		);
	}

	return null;
}
