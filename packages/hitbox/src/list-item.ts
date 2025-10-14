import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import { stable } from './internal/memoize';

export type Operation = 'reorder-before' | 'reorder-after' | 'combine';

type Axis = 'horizontal' | 'vertical';

export type Instruction = {
	[TOperation in Operation]: {
		operation: TOperation;
		blocked: boolean;
		axis: Axis;
	};
}[Operation];

// using a symbol so we can guarantee a key with a unique value
const uniqueKey = Symbol('list-item-instruction');

const axisLookup = {
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

type AxisDefinition = (typeof axisLookup)[keyof typeof axisLookup];

function reorderAndCombine({
	client,
	borderBox,
	axis,
}: {
	client: Position;
	borderBox: DOMRect;
	axis: AxisDefinition;
}): 'reorder-before' | 'reorder-after' | 'combine' {
	const quarterOfSize = borderBox[axis.size] / 4;

	// In the top 1/4: reorder-before
	// On the line: reorder-before to give a slight preference to reordering
	if (client[axis.point] <= borderBox[axis.start] + quarterOfSize) {
		return 'reorder-before';
	}
	// In the bottom 1/4: reorder-after
	// On the line: reorder-after to give a slight preference to reordering
	if (client[axis.point] >= borderBox[axis.end] - quarterOfSize) {
		return 'reorder-after';
	}
	return 'combine';
}

function reorder({
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

// Note: not using `memoize-one` as all we need is a cached value.
// We do not need to avoid executing an expensive function.
const memoizeInstruction = stable<Instruction>();

export type Availability = 'available' | 'not-available' | 'blocked';

function isPossible(...values: Availability[]): boolean {
	return values.every((value) => value === 'available' || value === 'blocked');
}

function isNotAvailable(...values: Availability[]): boolean {
	return values.every((value) => value === 'not-available');
}

/**
 * Calculate the `Instruction` for a drag operation based on the users input
 * and the available operations.
 *
 * Notes:
 *
 * - `attachInstruction` can attach an `Instruction | null`. `null` will be attached if all `operations` provided are `"not-available"`.
 * - Use `extractInstruction` to obtain the `Instruction | null`
 *
 * @example
 *
 * ```ts
 * dropTargetForElements({
 * 	element: myElement,
 *  getData({input, element}) {
 *    // The data I want to attach to the drop target
 * 		const myData = {type: 'card', cardId: 'A'};
 *
 *    // Add an instruction to myData
 *    return attachInstruction(myData, {
 * 			input,
 * 			element,
 * 			operations: {
 * 				'reorder-before': 'available',
 * 				'reorder-after': 'available',
 * 				combine: 'available',
 * 			}
 *    });
 *  }
 * });
 * ```
 */
export function attachInstruction(
	userData: Record<string | symbol, unknown>,
	{
		operations,
		element,
		input,
		axis: axisValue = 'vertical',
	}: {
		/**
		 * All operations are optional, and their default value is `"not-available"`.
		 * The hitbox will automatically adjust to account for which options are `"available"` or `"blocked"`.
		 */
		operations: {
			[TKey in Operation]?: Availability;
		};
		element: Element;
		input: Input;
		axis?: Axis;
	},
): Record<string | symbol, unknown> {
	const client: Position = {
		x: input.clientX,
		y: input.clientY,
	};
	const borderBox: DOMRect = element.getBoundingClientRect();
	const axis: AxisDefinition = axisLookup[axisValue];

	const combine = operations.combine ?? 'not-available';
	const reorderAbove = operations['reorder-before'] ?? 'not-available';
	const reorderBelow = operations['reorder-after'] ?? 'not-available';

	const operation: Operation | null = (() => {
		// Combining not possible
		if (!isPossible(combine)) {
			// can reorder above and below
			if (isPossible(reorderAbove, reorderBelow)) {
				return reorder({ client, borderBox, axis });
			}

			// can only reorder above
			if (isPossible(reorderAbove)) {
				return 'reorder-before';
			}

			// can only reorder below
			if (isPossible(reorderBelow)) {
				return 'reorder-after';
			}

			// no `true` values - no Outcome available.
			return null;
		}

		// combining is available

		const result = reorderAndCombine({ client, borderBox, axis });

		if (result === 'reorder-after') {
			return isNotAvailable(reorderBelow) ? 'combine' : result;
		}

		if (result === 'reorder-before') {
			return isNotAvailable(reorderAbove) ? 'combine' : result;
		}
		return result;
	})();

	// We cannot attach an instruction - all values passed where `false` or no values passed
	if (!operation) {
		return userData;
	}

	const instruction: Instruction = {
		operation,
		blocked: operations[operation] === 'blocked',
		axis: axisValue,
	};
	const memoized: Instruction = memoizeInstruction(instruction);

	return {
		...userData,
		[uniqueKey]: memoized,
	};
}

/**
 * Extract an instruction from the user data if it is available.
 *
 *
 * @example
 *
 * ```ts
 * monitorForElements({
 *  onDrop({location}) {
 *   const innerMost = location.current.dropTargets[0];
 *   if(!innerMost) {
 *     return;
 *   }
 *   const instruction: Instruction | null = extractInstruction(innerMost.data);
 *  }
 * });
 * ```
 */
export function extractInstruction(userData: Record<string | symbol, unknown>): Instruction | null {
	return (userData[uniqueKey] as Instruction) ?? null;
}
