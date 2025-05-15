import {
	attachInstruction,
	extractInstruction,
	type Instruction,
	type Operation,
} from '../../src/list-item';

import { between, getDefaultInput, getElements, getRect } from './_util';

type TOperationArgs = Parameters<typeof attachInstruction>[1]['operations'];

const rect = getRect({
	top: 10,
	left: 10,
	right: 100,
	bottom: 100,
});

const centerY = between(rect.top, rect.bottom);
const centerX = between(rect.left, rect.right);

const axis = ['horizontal', 'vertical'] as const;

type Axis = (typeof axis)[number];

const verticalAxis = {
	start: 'top',
	end: 'bottom',
	mainAxisPoint: 'clientY',
	crossAxisPoint: 'clientX',
	size: 'height',
	crossAxisCenter: centerX,
} as const;
const horizontalAxis = {
	start: 'left',
	end: 'right',
	mainAxisPoint: 'clientX',
	crossAxisPoint: 'clientY',
	size: 'width',
	crossAxisCenter: centerY,
} as const;

function getInputs(axis: Axis) {
	const lookup = axis === 'horizontal' ? horizontalAxis : verticalAxis;
	const quarterOfSize = rect[lookup.size] / 4;
	const threeQuartersOfSize = quarterOfSize * 3;

	const inputs = {
		// Adding aboveTop to validate what happens when the
		// the input is outside of the elements bounds
		beforeStart: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] - 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		start: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start],
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justBeforeOneQuarter: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + quarterOfSize - 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		onOneQuarter: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + quarterOfSize,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justAfterOneQuarter: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + quarterOfSize + 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justBeforeCenter: getDefaultInput({
			[lookup.mainAxisPoint]: between(rect[lookup.start], rect[lookup.end]) - 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		center: getDefaultInput({
			[lookup.mainAxisPoint]: between(rect[lookup.start], rect[lookup.end]),
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justAfterCenter: getDefaultInput({
			[lookup.mainAxisPoint]: between(rect[lookup.start], rect[lookup.end]) + 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justBeforeThreeQuarters: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + threeQuartersOfSize - 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		onThreeQuarters: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + threeQuartersOfSize,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		justAfterThreeQuarters: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.start] + threeQuartersOfSize + 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		end: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.end],
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
		// Adding afterEnd to validate what happens when the
		// the input is outside of the elements bounds
		afterEnd: getDefaultInput({
			[lookup.mainAxisPoint]: rect[lookup.end] + 1,
			[lookup.crossAxisPoint]: lookup.crossAxisCenter,
		}),
	};
	return inputs;
}

const presetOperations = {
	reorderBeforeOnly: { 'reorder-before': 'available' },
	reorderAfterOnly: { 'reorder-after': 'available' },
	combineOnly: { combine: 'available' },
	reorder: { 'reorder-before': 'available', 'reorder-after': 'available' },
	all: { 'reorder-before': 'available', 'reorder-after': 'available', combine: 'available' },
	combineAndReorderBefore: { 'reorder-before': 'available', combine: 'available' },
	combineAndReorderAfter: { 'reorder-after': 'available', combine: 'available' },
	none: {},
} satisfies { [TKey: string]: TOperationArgs };

function block(args: TOperationArgs): TOperationArgs {
	return Object.keys(args).reduce((acc, key) => {
		acc[key as Operation] = 'blocked';
		return acc;
	}, {} as TOperationArgs);
}

const presetOperationsBlocked = {
	reorderBeforeOnly: block(presetOperations.reorderBeforeOnly),
	reorderAfterOnly: block(presetOperations.reorderAfterOnly),
	combineOnly: block(presetOperations.combineOnly),
	reorder: block(presetOperations.reorder),
	all: block(presetOperations.all),
	combineAndReorderBefore: block(presetOperations.combineAndReorderBefore),
	combineAndReorderAfter: block(presetOperations.combineAndReorderAfter),
	// Not adding "blocked" as that would make the hitbox available for that operation
	none: {},
} satisfies { [TKey in keyof typeof presetOperations]: TOperationArgs };

type TExpectationMap = {
	[TOperationPresetKey in keyof typeof presetOperations]: {
		[TInputPresetKey in keyof ReturnType<typeof getInputs>]: Operation | null;
	};
};

// I made a big map so we know we have covered every use case
const expectations: TExpectationMap = {
	reorderBeforeOnly: {
		beforeStart: 'reorder-before',
		start: 'reorder-before',
		justBeforeOneQuarter: 'reorder-before',
		onOneQuarter: 'reorder-before',
		justAfterOneQuarter: 'reorder-before',
		justBeforeCenter: 'reorder-before',
		center: 'reorder-before',
		justAfterCenter: 'reorder-before',
		justBeforeThreeQuarters: 'reorder-before',
		onThreeQuarters: 'reorder-before',
		justAfterThreeQuarters: 'reorder-before',
		end: 'reorder-before',
		afterEnd: 'reorder-before',
	},
	combineOnly: {
		beforeStart: 'combine',
		start: 'combine',
		justBeforeOneQuarter: 'combine',
		onOneQuarter: 'combine',
		justAfterOneQuarter: 'combine',
		justBeforeCenter: 'combine',
		center: 'combine',
		justAfterCenter: 'combine',
		justBeforeThreeQuarters: 'combine',
		onThreeQuarters: 'combine',
		justAfterThreeQuarters: 'combine',
		end: 'combine',
		afterEnd: 'combine',
	},
	reorderAfterOnly: {
		beforeStart: 'reorder-after',
		start: 'reorder-after',
		justBeforeOneQuarter: 'reorder-after',
		onOneQuarter: 'reorder-after',
		justAfterOneQuarter: 'reorder-after',
		justBeforeCenter: 'reorder-after',
		center: 'reorder-after',
		justAfterCenter: 'reorder-after',
		justBeforeThreeQuarters: 'reorder-after',
		onThreeQuarters: 'reorder-after',
		justAfterThreeQuarters: 'reorder-after',
		end: 'reorder-after',
		afterEnd: 'reorder-after',
	},
	reorder: {
		beforeStart: 'reorder-before',
		start: 'reorder-before',
		justBeforeOneQuarter: 'reorder-before',
		onOneQuarter: 'reorder-before',
		justAfterOneQuarter: 'reorder-before',
		justBeforeCenter: 'reorder-before',
		center: 'reorder-after', // Giving a slight preference to reordering forward
		justAfterCenter: 'reorder-after',
		justBeforeThreeQuarters: 'reorder-after',
		onThreeQuarters: 'reorder-after',
		justAfterThreeQuarters: 'reorder-after',
		end: 'reorder-after',
		afterEnd: 'reorder-after',
	},
	all: {
		beforeStart: 'reorder-before',
		start: 'reorder-before',
		justBeforeOneQuarter: 'reorder-before',
		onOneQuarter: 'reorder-before', // Giving a slight preference to reordering
		justAfterOneQuarter: 'combine',
		justBeforeCenter: 'combine',
		center: 'combine',
		justAfterCenter: 'combine',
		justBeforeThreeQuarters: 'combine',
		onThreeQuarters: 'reorder-after', // Giving a slight preference to reordering
		justAfterThreeQuarters: 'reorder-after',
		end: 'reorder-after',
		afterEnd: 'reorder-after',
	},
	combineAndReorderBefore: {
		beforeStart: 'reorder-before',
		start: 'reorder-before',
		justBeforeOneQuarter: 'reorder-before',
		onOneQuarter: 'reorder-before', // Giving a slight preference to reordering
		justAfterOneQuarter: 'combine',
		justBeforeCenter: 'combine',
		center: 'combine',
		justAfterCenter: 'combine',
		justBeforeThreeQuarters: 'combine',
		onThreeQuarters: 'combine',
		justAfterThreeQuarters: 'combine',
		end: 'combine',
		afterEnd: 'combine',
	},
	combineAndReorderAfter: {
		beforeStart: 'combine',
		start: 'combine',
		justBeforeOneQuarter: 'combine',
		onOneQuarter: 'combine',
		justAfterOneQuarter: 'combine',
		justBeforeCenter: 'combine',
		center: 'combine',
		justAfterCenter: 'combine',
		justBeforeThreeQuarters: 'combine',
		onThreeQuarters: 'reorder-after', // Giving a slight preference to reordering
		justAfterThreeQuarters: 'reorder-after',
		end: 'reorder-after',
		afterEnd: 'reorder-after',
	},
	none: {
		beforeStart: null,
		start: null,
		justBeforeOneQuarter: null,
		onOneQuarter: null,
		justAfterOneQuarter: null,
		justBeforeCenter: null,
		center: null,
		justAfterCenter: null,
		justBeforeThreeQuarters: null,
		onThreeQuarters: null,
		justAfterThreeQuarters: null,
		end: null,
		afterEnd: null,
	},
};

axis.forEach((axis) => {
	describe(`axis: ${axis}`, () => {
		const presetInputs = getInputs(axis);
		const inputPresetKeys = Object.keys(presetInputs) as (keyof typeof presetInputs)[];
		const operationPresetKeys = Object.keys(presetOperations) as (keyof typeof presetOperations)[];

		operationPresetKeys.forEach((operationPresetKey) => {
			describe(`operation: ${operationPresetKey}`, () => {
				inputPresetKeys.forEach((inputPresetKey) => {
					test(`input:${inputPresetKey}`, () => {
						const [element] = getElements();
						element.getBoundingClientRect = () => rect;

						const result = extractInstruction(
							attachInstruction(
								{},
								{
									element,
									axis,
									input: presetInputs[inputPresetKey],
									operations: presetOperations[operationPresetKey],
								},
							),
						);

						const expected = expectations[operationPresetKey][inputPresetKey];

						// result can be null if nothing is available or blocked;
						if (!result) {
							expect(result).toBe(expected);
							return;
						}

						expect(result.operation).toEqual(expected);
						expect(result.blocked).toBe(false);
						expect(result.axis).toBe(axis);
					});

					// This should have no impact on the result, but just checking
					test(`input:${inputPresetKey} [other operations set to "not-available"]`, () => {
						const [element] = getElements();
						element.getBoundingClientRect = () => rect;

						const defaults: TOperationArgs = {
							combine: 'not-available',
							'reorder-before': 'not-available',
							'reorder-after': 'not-available',
						};
						const operations: TOperationArgs = {
							...defaults,
							...presetOperations[operationPresetKey],
						};

						const result = extractInstruction(
							attachInstruction(
								{},
								{
									element,
									axis,
									input: presetInputs[inputPresetKey],
									operations: operations,
								},
							),
						);
						const expected = expectations[operationPresetKey][inputPresetKey];

						// result can be null if nothing is available or blocked;
						if (!result) {
							expect(result).toBe(expected);
							return;
						}

						expect(result.operation).toEqual(expected);
						expect(result.blocked).toBe(false);
						expect(result.axis).toBe(axis);
					});

					// Should be the same outcome as not blocked,
					// just checking that blocking does not impact the hitboxes.
					test(`input:${inputPresetKey} [blocked]`, () => {
						const [element] = getElements();
						element.getBoundingClientRect = () => rect;

						const result: Instruction | null = extractInstruction(
							attachInstruction(
								{},
								{
									element,
									axis,
									input: presetInputs[inputPresetKey],
									operations: presetOperationsBlocked[operationPresetKey],
								},
							),
						);

						const expected = expectations[operationPresetKey][inputPresetKey];

						// result can be null if nothing is available or blocked;
						if (!result) {
							expect(result).toEqual(expected);
							return;
						}

						expect(result.operation).toEqual(expected);
						expect(result.blocked).toBe(true);
						expect(result.axis).toBe(axis);
					});
				});
			});
		});

		it('should create no instruction when there are no operations', () => {
			const [element] = getElements();
			element.getBoundingClientRect = () => rect;

			const result = extractInstruction(
				attachInstruction(
					{},
					{
						element,
						axis,
						input: presetInputs.center,
						operations: {},
					},
				),
			);

			expect(result).toBe(null);
		});

		it('should create no instruction when there are no available operations', () => {
			const [element] = getElements();
			element.getBoundingClientRect = () => rect;

			const result = extractInstruction(
				attachInstruction(
					{},
					{
						element,
						axis,
						input: presetInputs.center,
						operations: {
							'reorder-after': 'not-available',
							'reorder-before': 'not-available',
							combine: 'not-available',
						},
					},
				),
			);

			expect(result).toBe(null);
		});

		it('should not impact user data', () => {
			const [element] = getElements();
			element.getBoundingClientRect = () => rect;
			const data = { message: 'hello' };

			const updated = attachInstruction(data, {
				element,
				axis,
				input: getDefaultInput(),
				operations: { 'reorder-after': 'available' },
			});

			expect(updated.message).toEqual('hello');
		});
	});
});
