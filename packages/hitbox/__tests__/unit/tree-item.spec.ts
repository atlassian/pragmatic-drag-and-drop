import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import {
  attachInstruction,
  extractInstruction,
  Instruction,
  ItemMode,
} from '../../src/tree-item';

import { getDefaultInput, getElements, getRect } from './_util';

type Scenario = {
  description: string;
  mode: ItemMode;
  block?: Instruction['type'][];
  expected: Instruction;
  hitbox: DOMRect;
  currentLevel: number;
  indentPerLevel: number;
  only?: boolean;
};

const rect = getRect({
  top: 0,
  left: 0,
  right: 100,
  bottom: 100,
});

const quarterOfHeight = rect.height / 4;

const baseData = {
  currentLevel: 0,
  indentPerLevel: 20,
};

type Point = Position & { label: string };

function getPoints(rect: DOMRect): Point[] {
  return [
    { label: 'top left', x: rect.left, y: rect.top },
    { label: 'top right', x: rect.right, y: rect.top },
    { label: 'bottom right', x: rect.right, y: rect.bottom },
    { label: 'bottom left', x: rect.left, y: rect.bottom },
    {
      label: 'center',
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    },
  ];
}

const scenarios: Scenario[] = [
  {
    mode: 'standard',
    description: 'in top quarter should reorder-above',
    expected: { type: 'reorder-above', ...baseData },
    hitbox: getRect({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.top + quarterOfHeight,
    }),
    ...baseData,
  },
  {
    mode: 'standard',
    description: 'in middle should make-child',
    expected: { type: 'make-child', ...baseData },
    // 'On the line' is given preference to reordering operations
    hitbox: getRect({
      top: rect.top + quarterOfHeight + 1,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom - quarterOfHeight - 1,
    }),
    ...baseData,
  },
  {
    mode: 'standard',
    description: 'in bottom quarter should reorder-below',
    expected: { type: 'reorder-below', ...baseData },
    hitbox: getRect({
      top: rect.bottom - quarterOfHeight,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    }),
    ...baseData,
  },
  {
    mode: 'expanded',
    description: 'in top 1/4 should reorder above (same as "standard")',
    expected: { type: 'reorder-above', ...baseData },
    hitbox: getRect({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      // we are ensuring the whole top 1/4 is the hit zone to match "standard" items
      bottom: rect.top + quarterOfHeight,
    }),
    ...baseData,
  },
  {
    mode: 'expanded',
    description: 'in bottom 3/4 should make-child',
    expected: { type: 'make-child', ...baseData },
    hitbox: getRect({
      top: rect.top + quarterOfHeight + 1,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    }),
    ...baseData,
  },
  {
    mode: 'last-in-group',
    description: '[visible item] in top quarter should reorder-above',
    expected: { type: 'reorder-above', indentPerLevel: 20, currentLevel: 2 },
    indentPerLevel: 20,
    currentLevel: 2,
    hitbox: getRect({
      top: rect.top,
      left: rect.left + 20 * 2,
      right: rect.right,
      bottom: rect.top + quarterOfHeight,
    }),
  },
  {
    mode: 'last-in-group',
    description: '[visible item] in middle should make-child',
    expected: { type: 'make-child', indentPerLevel: 20, currentLevel: 2 },
    indentPerLevel: 20,
    currentLevel: 2,
    hitbox: getRect({
      top: rect.top + quarterOfHeight + 1,
      left: rect.left + 20 * 2,
      right: rect.right,
      bottom: rect.bottom - quarterOfHeight - 1,
    }),
  },
  {
    mode: 'last-in-group',
    description: '[visible item] in bottom quarter should reorder-below',
    expected: { type: 'reorder-below', indentPerLevel: 20, currentLevel: 2 },
    indentPerLevel: 20,
    currentLevel: 2,
    hitbox: getRect({
      top: rect.bottom - quarterOfHeight,
      left: rect.left + 20 * 2,
      right: rect.right,
      bottom: rect.bottom,
    }),
  },
  {
    mode: 'last-in-group',
    description: '[invisible item] in top half should reorder-above',
    expected: { type: 'reorder-above', indentPerLevel: 20, currentLevel: 2 },
    indentPerLevel: 20,
    currentLevel: 2,
    hitbox: getRect({
      top: rect.top,
      left: rect.left,
      // On the edge = in the 'visible' part of the item
      right: rect.left + 20 * 2 - 1,
      // Giving 1px preference to the 'reparent' actions
      bottom: rect.top + rect.height / 2 - 1,
    }),
  },
  createPullBackScenario({
    currentLevel: 2,
    desiredLevel: 1,
    indentPerLevel: 20,
  }),
  createPullBackScenario({
    currentLevel: 1,
    desiredLevel: 0,
    indentPerLevel: 20,
  }),
  createPullBackScenario({
    currentLevel: 2,
    desiredLevel: 0,
    indentPerLevel: 20,
  }),
  (() => {
    const indentPerLevel = 20;
    const currentLevel = 2;
    return {
      mode: 'last-in-group',
      description: `[invisible item] pulling back on lower half should reparent (moving into space before border box)`,
      expected: {
        type: 'reparent',
        indentPerLevel,
        currentLevel,
        desiredLevel: 0,
      },
      indentPerLevel,
      currentLevel,
      hitbox: getRect({
        top: rect.top + rect.height / 2,
        left: rect.left - 1,
        right: rect.left + indentPerLevel - 1,
        bottom: rect.bottom,
      }),
    };
  })(),
];

function createPullBackScenario({
  currentLevel,
  desiredLevel,
  indentPerLevel,
}: {
  currentLevel: number;
  desiredLevel: number;
  indentPerLevel: number;
}): Scenario {
  const left = rect.left + indentPerLevel * desiredLevel;
  // the 'zone' for this hitbox is a single level beyond the desired level
  // 'on the edge line' is reserved for the region after
  const right = left + indentPerLevel - 1;
  return {
    mode: 'last-in-group',
    description: `[invisible item] pulling back on lower half should reparent (lvl${currentLevel} -> lvl${desiredLevel})`,
    expected: {
      type: 'reparent',
      indentPerLevel,
      currentLevel,
      desiredLevel,
    },
    indentPerLevel,
    currentLevel,
    hitbox: getRect({
      top: rect.top + rect.height / 2,
      bottom: rect.bottom,
      left,
      right,
    }),
  };
}

// Checking that blocking an instruction will block the result
const blocked: Scenario[] = scenarios.map((scenario): Scenario => {
  // Cannot block the 'instruction-blocked' instruction
  if (scenario.expected.type === 'instruction-blocked') {
    return scenario;
  }
  return {
    ...scenario,
    block: [scenario.expected.type],
    description: `[blocked] ${scenario.description}`,
    expected: {
      type: 'instruction-blocked',
      desired: scenario.expected,
    },
  };
});

[...scenarios, ...blocked].forEach(scenario => {
  const base = scenario.only ? test.only : test;

  describe(`[mode: ${scenario.mode}] ${scenario.description}`, () => {
    const points = getPoints(scenario.hitbox);

    points.forEach(point => {
      base(`case: ${point.label} {x:${point.x}, y:${point.y}}`, () => {
        const [element] = getElements();
        element.getBoundingClientRect = () => rect;

        const result = extractInstruction(
          attachInstruction(
            {},
            {
              element,
              mode: scenario.mode,
              input: getDefaultInput({
                clientX: point.x,
                clientY: point.y,
              }),
              currentLevel: scenario.currentLevel,
              indentPerLevel: scenario.indentPerLevel,
              block: scenario.block ?? [],
            },
          ),
        );
        expect(result).toEqual(scenario.expected);
      });
    });
  });
});

it('should not impact user data', () => {
  const [element] = getElements();
  element.getBoundingClientRect = () => rect;
  const data = { message: 'hello' };

  const updated = attachInstruction(data, {
    element,
    mode: 'standard',
    input: getDefaultInput(),
    currentLevel: 0,
    indentPerLevel: 20,
  });

  expect(updated.message).toEqual('hello');
});
