import type { Input } from '@atlaskit/pragmatic-drag-and-drop/types';

import { attachClosestEdge, extractClosestEdge } from '../../src/closest-edge';
import type { Edge } from '../../src/types';

import { between, getDefaultInput, getElements, getRect } from './_util';

const rect = getRect({
	top: 0,
	left: 0,
	right: 100,
	bottom: 100,
});

const allEdges: Edge[] = ['top', 'right', 'bottom', 'left'];

type Scenario = {
	description: string;
	input: Input;
	allowedEdges: Edge[];
	expected: Edge | null;
	only?: boolean;
};

const scenarios: Scenario[] = [
	{
		description: 'on center of top edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.top,
		}),
		allowedEdges: allEdges,
		expected: 'top',
	},
	{
		description: 'just below top edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.top + 1,
		}),
		allowedEdges: allEdges,
		expected: 'top',
	},
	{
		description: 'just above top edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.top - 1,
		}),
		allowedEdges: allEdges,
		expected: 'top',
	},
	{
		description: 'far away from top edge (testing negative values)',
		input: getDefaultInput({
			// a touch closer to the left
			clientX: between(rect.left, rect.right) - 1,
			clientY: rect.top - 1000,
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'on center of right edge',
		input: getDefaultInput({
			clientX: rect.right,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'right',
	},
	{
		description: 'just outside of right edge',
		input: getDefaultInput({
			clientX: rect.right + 1,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'right',
	},
	{
		description: 'just inside of right edge',
		input: getDefaultInput({
			clientX: rect.right - 1,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'right',
	},
	{
		description: 'far away from right edge (testing negative values)',
		input: getDefaultInput({
			clientX: rect.right + 1000,
			// a touch closer to the bottom
			clientY: between(rect.top, rect.bottom) + 1,
		}),
		allowedEdges: allEdges,
		expected: 'bottom',
	},
	{
		description: 'on center of bottom edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.bottom,
		}),
		allowedEdges: allEdges,
		expected: 'bottom',
	},
	{
		description: 'just below bottom edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.bottom + 1,
		}),
		allowedEdges: allEdges,
		expected: 'bottom',
	},
	{
		description: 'just above bottom edge',
		input: getDefaultInput({
			clientX: between(rect.left, rect.right),
			clientY: rect.bottom - 1,
		}),
		allowedEdges: allEdges,
		expected: 'bottom',
	},
	{
		description: 'far away from bottom edge (testing negative values)',
		input: getDefaultInput({
			// slightly closer to left
			clientX: between(rect.left, rect.right) - 1,
			clientY: rect.bottom + 1000,
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'on center of left edge',
		input: getDefaultInput({
			clientX: rect.left,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'just outside of left edge',
		input: getDefaultInput({
			clientX: rect.left - 1,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'just inside left edge',
		input: getDefaultInput({
			clientX: rect.left + 1,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'far away from left edge (testing negative values)',
		input: getDefaultInput({
			clientX: rect.left + 1,
			clientY: between(rect.top, rect.bottom),
		}),
		allowedEdges: allEdges,
		expected: 'left',
	},
	{
		description: 'use only available edge',
		input: getDefaultInput({
			clientX: rect.left,
			clientY: between(rect.top, rect.bottom),
		}),
		// normally closest to left edge but only allowing right edge
		allowedEdges: ['right'],
		expected: 'right',
	},
	{
		description: 'return null if no available edges',
		input: getDefaultInput({
			clientX: rect.left,
			clientY: between(rect.top, rect.bottom),
		}),
		// normally closest to left edge but only allowing right edge
		allowedEdges: [],
		expected: null,
	},
	{
		description: 'far away from left edge (handling negative values)',
		input: getDefaultInput({
			// left edge is actually really far away
			clientX: rect.left - 1000,
			// pushing closer to bottom so after `left` the next closest will be `bottom`
			clientY: between(rect.top, rect.bottom) + 1,
		}),
		// normally closest to left edge but only allowing right edge
		allowedEdges: allEdges,
		expected: 'bottom',
	},
];

scenarios.forEach((scenario: Scenario) => {
	const base = scenario.only ? test.only : test;

	base(`scenario: ${scenario.description}`, () => {
		const [element] = getElements();
		element.getBoundingClientRect = () => rect;

		const result = extractClosestEdge(
			attachClosestEdge(
				{},
				{ element, input: scenario.input, allowedEdges: scenario.allowedEdges },
			),
		);
		expect(result).toEqual(scenario.expected);
	});
});

it('should not impact user data', () => {
	const [element] = getElements();
	element.getBoundingClientRect = () => rect;
	const data = { message: 'hello' };

	const updated = attachClosestEdge(data, {
		element,
		input: getDefaultInput(),
		allowedEdges: ['top'],
	});

	expect(updated.message).toEqual('hello');
});
