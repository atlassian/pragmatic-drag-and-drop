import { attachInstruction, extractInstruction, type Instruction } from '../../src/list-item';

import { between, getDefaultInput, getElements, getRect } from './_util';

const rect = getRect({
	top: 0,
	left: 0,
	right: 100,
	bottom: 100,
});

const [element] = getElements();
element.getBoundingClientRect = () => rect;

const centerX = between(rect.left, rect.right);

it('should return the same instruction reference when the instruction has not changed', () => {
	const expected: Instruction = {
		operation: 'reorder-before',
		blocked: false,
		axis: 'vertical',
	};

	const first = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	expect(first).toEqual(expected);

	const second = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				// still in the top zone
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top + 1,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	expect(second).toEqual(expected);
	// expecting reference to match
	expect(first).toBe(second);

	// input is changing, but will still be in the 'reorder-above' hitzone
	const third = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				// still in the top zone
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top + 2,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	expect(third).toEqual(expected);
	// expecting reference to match
	expect(first).toBe(third);
});

it('should return a new instruction the result instruction changes', () => {
	const first = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-before',
			blocked: false,
			axis: 'vertical',
		};
		expect(first).toEqual(expected);
	}

	const second = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.bottom,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-after',
			blocked: false,
			axis: 'vertical',
		};
		expect(second).toEqual(expected);
		// second is a new object
		expect(second).not.toBe(first);
	}
});

it('should memoize blocked instructions', () => {
	const expected: Instruction = {
		operation: 'reorder-before',
		blocked: true,
		axis: 'vertical',
	};
	const operations = { 'reorder-before': 'blocked', 'reorder-after': 'available' } as const;

	const first = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top,
				}),
				operations,
			},
		),
	);

	expect(first).toEqual(expected);

	const second = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				// still in the top zone
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top + 1,
				}),
				operations,
			},
		),
	);

	expect(second).toEqual(expected);
	// expecting reference to match
	expect(first).toBe(second);

	const third = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				// still in the top zone
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top + 2,
				}),
				operations,
			},
		),
	);

	expect(third).toEqual(expected);
	// expecting reference to match
	expect(first).toBe(third);
});

it('should return a new instruction when an operation becomes blocked', () => {
	const first = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top,
				}),
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-before',
			blocked: false,
			axis: 'vertical',
		};
		expect(first).toEqual(expected);
	}

	const second = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: getDefaultInput({
					clientX: centerX,
					clientY: rect.top,
				}),
				operations: { 'reorder-before': 'blocked', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-before',
			blocked: true,
			axis: 'vertical',
		};
		expect(second).toEqual(expected);
		// second is a new object
		expect(second).not.toBe(first);
	}
});

it('should return a new instruction if the axis changes', () => {
	const topLeft = getDefaultInput({
		clientX: rect.left,
		clientY: rect.top,
	});
	const first = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: topLeft,
				axis: 'vertical',
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-before',
			blocked: false,
			axis: 'vertical',
		};
		expect(first).toEqual(expected);
	}

	const second = extractInstruction(
		attachInstruction(
			{},
			{
				element,
				input: topLeft,
				axis: 'horizontal',
				operations: { 'reorder-before': 'available', 'reorder-after': 'available' },
			},
		),
	);

	{
		const expected: Instruction = {
			operation: 'reorder-before',
			blocked: false,
			axis: 'horizontal',
		};
		expect(second).toEqual(expected);
		// second is a new object
		expect(second).not.toBe(first);
	}
});
