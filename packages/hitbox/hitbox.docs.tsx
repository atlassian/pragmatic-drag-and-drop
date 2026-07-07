/**
 * Structured MCP docs for `@atlaskit/pragmatic-drag-and-drop-hitbox`.
 *
 * ⚠️ Pilot / not yet final. This file is part of the libraries-content pilot
 * for the "Libraries, hooks, utilities in structured content" RFC. The
 * container schema and per-kind shapes are still in review — expect breaking
 * changes before this is rolled out broadly. Do not depend on the format yet.
 *
 * Like the live-region package, this is a pure-utility package — no React
 * components. The package only exposes content via subpath imports (the root
 * `index.ts` is intentionally empty), so each export below documents the
 * subpath it ships from.
 *
 * Contact #dst-structured-content in Slack with questions.
 */

import path from 'path';

import type { StructuredContentSource } from '@atlassian/structured-docs-types/types';

import packageJson from './package.json';

const packagePath = path.resolve(__dirname);

const documentation: StructuredContentSource = {
	package: {
		package: '@atlaskit/pragmatic-drag-and-drop-hitbox',
		packagePath,
		packageJson,
		overview:
			'Hitbox helpers for Pragmatic drag and drop. Attach interaction information (the closest edge of a drop target, a list-item instruction, etc.) to `userData` during `getData`, then extract it later in `onDrop` to drive the actual reorder/combine logic. Each helper ships from its own subpath import so consumers only pay for what they use.',
	},
	utilities: [
		{
			kind: 'function',
			name: 'attachClosestEdge',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge`. Computes which of the `allowedEdges` of an element is closest to the pointer and stores the result against a private symbol in `userData`. Pair with `extractClosestEdge` in `onDrop` for type-safe lookup.',
			status: 'general-availability',
			signature:
				'(userData: Record<string | symbol, unknown>, opts: { element: Element; input: Input; allowedEdges: Edge[] }) => Record<string | symbol, unknown>',
			parameters: [
				{
					name: 'userData',
					type: 'Record<string | symbol, unknown>',
					description:
						'The data object you are returning from the drop target `getData`. Returned as a new object — non-mutating.',
				},
				{
					name: 'opts',
					type: '{ element: Element; input: Input; allowedEdges: Edge[] }',
					description:
						'`element` is the drop target DOM node, `input` is the pointer input from the drop event, `allowedEdges` is the subset of `top` | `right` | `bottom` | `left` that should be considered.',
				},
			],
			returns: {
				type: 'Record<string | symbol, unknown>',
				description: 'A shallow copy of `userData` with the closest edge attached.',
			},
			usageGuidelines: [
				'Call from inside a drop target `getData` so the closest edge tracks the pointer as it moves.',
				'Always pair with `extractClosestEdge` — the value is stored against a non-public `Symbol` and is not directly accessible.',
			],
			keywords: ['pdnd', 'hitbox', 'attachClosestEdge', 'edge'],
			categories: ['drag-and-drop', 'utilities'],
			examples: [],
		},
		{
			kind: 'function',
			name: 'extractClosestEdge',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge`. Reads the edge previously written by `attachClosestEdge`. Returns `null` if no edge was attached.',
			status: 'general-availability',
			signature: '(userData: Record<string | symbol, unknown>) => Edge | null',
			parameters: [
				{
					name: 'userData',
					type: 'Record<string | symbol, unknown>',
					description:
						'The `userData` produced by `attachClosestEdge`, typically read from the dropped target.',
				},
			],
			returns: { type: 'Edge | null' },
			usageGuidelines: [
				'Use in `onDrag` or `onDrop` to decide whether to render the drop indicator above/below/left/right of the target.',
			],
			keywords: ['pdnd', 'hitbox', 'extractClosestEdge', 'edge'],
			categories: ['drag-and-drop', 'utilities'],
			examples: [],
		},
		{
			kind: 'function',
			name: 'attachInstruction',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/list-item`. Computes a list-item drop instruction (reorder-before, reorder-after, or combine) based on the operations declared as available, then stores it against `userData`. Disabled operations are silently ignored so the hitbox auto-adjusts.',
			status: 'general-availability',
			signature:
				"(userData: Record<string | symbol, unknown>, opts: { operations: { [op: string]: 'available' | 'blocked' | 'not-available' }; element: Element; input: Input; axis?: 'horizontal' | 'vertical' }) => Record<string | symbol, unknown>",
			parameters: [
				{ name: 'userData', type: 'Record<string | symbol, unknown>' },
				{
					name: 'opts',
					type: "{ operations: { 'reorder-before'?: Availability; 'reorder-after'?: Availability; combine?: Availability }; element: Element; input: Input; axis?: Axis }",
					description:
						'Each operation defaults to `"not-available"`. `axis` defaults to `"vertical"` for traditional top-to-bottom lists.',
				},
			],
			returns: { type: 'Record<string | symbol, unknown>' },
			usageGuidelines: [
				'Use when implementing list reorder UI — pair with `extractInstruction` in `onDrop` to perform the actual move.',
				'When all operations are `"not-available"` the helper returns `userData` unchanged; `extractInstruction` will then return `null`.',
			],
			keywords: ['pdnd', 'hitbox', 'attachInstruction', 'reorder', 'list-item'],
			categories: ['drag-and-drop', 'utilities'],
			examples: [],
		},
		{
			kind: 'function',
			name: 'extractInstruction',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/list-item`. Reads the instruction previously written by `attachInstruction`. Returns `null` when no instruction is available (e.g. all operations were blocked).',
			status: 'general-availability',
			signature: '(userData: Record<string | symbol, unknown>) => Instruction | null',
			parameters: [{ name: 'userData', type: 'Record<string | symbol, unknown>' }],
			returns: { type: 'Instruction | null' },
			keywords: ['pdnd', 'hitbox', 'extractInstruction', 'reorder', 'list-item'],
			categories: ['drag-and-drop', 'utilities'],
			examples: [],
		},
		{
			kind: 'function',
			name: 'getReorderDestinationIndex',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/list-item`. Pure function that returns the array index the dragged item should land at, given the start index, the index of the drop target, the closest edge of that target, and the axis. Use after `extractClosestEdge` to translate edge info into a concrete index for an array splice/move.',
			status: 'general-availability',
			signature:
				"(opts: { startIndex: number; closestEdgeOfTarget: Edge | null; indexOfTarget: number; axis: 'horizontal' | 'vertical' }) => number",
			parameters: [
				{
					name: 'opts',
					type: "{ startIndex: number; closestEdgeOfTarget: Edge | null; indexOfTarget: number; axis: 'vertical' | 'horizontal' }",
				},
			],
			returns: {
				type: 'number',
				description:
					'The destination index. If the start and target indices are the same, or either index is `-1`, the original `startIndex` is returned unchanged.',
			},
			usageGuidelines: [
				'Use as the final step of a list reorder in `onDrop` — apply the returned index to your array model.',
			],
			keywords: ['pdnd', 'hitbox', 'getReorderDestinationIndex', 'reorder'],
			categories: ['drag-and-drop', 'utilities'],
			examples: [],
		},
		{
			kind: 'type',
			name: 'Edge',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge`. String literal union of the four cardinal edges of a drop target.',
			status: 'general-availability',
			definition: "type Edge = 'top' | 'right' | 'bottom' | 'left'",
			keywords: ['pdnd', 'hitbox', 'Edge', 'type'],
			categories: ['drag-and-drop', 'types'],
			examples: [],
		},
		{
			kind: 'type',
			name: 'Instruction',
			description:
				'Imported from `@atlaskit/pragmatic-drag-and-drop-hitbox/list-item`. Discriminated union describing what a drop on a list item should do. `operation` is one of `reorder-before` | `reorder-after` | `combine`. `blocked: true` signals the operation is logically valid but has been disallowed (so consumers can show a "not allowed" affordance).',
			status: 'general-availability',
			definition:
				"type Instruction = { operation: 'reorder-before' | 'reorder-after' | 'combine'; blocked: boolean; axis: 'horizontal' | 'vertical' }",
			keywords: ['pdnd', 'hitbox', 'Instruction', 'type', 'reorder'],
			categories: ['drag-and-drop', 'types'],
			examples: [],
		},
	],
};

export default documentation;
