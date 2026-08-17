/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export type Operation = 'reorder-before' | 'reorder-after' | 'combine';

export type Axis = 'horizontal' | 'vertical';

export type Instruction = {
	[TOperation in Operation]: {
		operation: TOperation;
		blocked: boolean;
		axis: Axis;
	};
}[Operation];

// using a symbol so we can guarantee a key with a unique value
export const uniqueKey: any = Symbol('list-item-instruction');

export const axisLookup = {
	vertical: {
		start: 'top',
		end: 'bottom',
		size: 'height',
		point: 'y',
	},
	horizontal: {
		start: 'left',
		end: 'right',
		size: 'width',
		point: 'x',
	},
} as const;

export type AxisDefinition = (typeof axisLookup)[keyof typeof axisLookup];

export function reorder({
	client,
	borderBox,
	axis,
}: {
	client: Position;
	borderBox: DOMRect;
	axis: AxisDefinition;
}): 'reorder-before' | 'reorder-after' {
	const halfSize = borderBox[axis.size] / 2;

	// In the top 1/2: reorder-before
	// On the line: reorder-after to give a slight preference to moving forward
	if (client[axis.point] < borderBox[axis.start] + halfSize) {
		return 'reorder-before';
	}
	return 'reorder-after';
}

export type Availability = 'available' | 'not-available' | 'blocked';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { attachInstruction } from './attach-instruction-2';
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { extractInstruction } from './extract-instruction-2';
