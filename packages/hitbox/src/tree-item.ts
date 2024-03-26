import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export type ItemMode = 'standard' | 'expanded' | 'last-in-group';

export type Instruction =
  | {
      type: 'reorder-above';
      currentLevel: number;
      indentPerLevel: number;
    }
  | {
      type: 'reorder-below';
      currentLevel: number;
      indentPerLevel: number;
    }
  | {
      type: 'make-child';
      currentLevel: number;
      indentPerLevel: number;
    }
  | {
      type: 'reparent';
      currentLevel: number;
      indentPerLevel: number;
      desiredLevel: number;
    }
  | {
      type: 'instruction-blocked';
      desired: Exclude<Instruction, { type: 'instruction-blocked' }>;
    };
// using a symbol so we can guarantee a key with a unique value
const uniqueKey = Symbol('tree-item-instruction');

function getCenter(rect: DOMRect): Position {
  return {
    x: (rect.right + rect.left) / 2,
    y: (rect.bottom + rect.top) / 2,
  };
}

function standardHitbox({
  client,
  borderBox,
}: {
  client: Position;
  borderBox: DOMRect;
}): 'reorder-above' | 'reorder-below' | 'make-child' {
  const quarterOfHeight = borderBox.height / 4;

  // In the top 1/4: reorder-above
  // On the line = in the top 1/4 to give this zone a bit more space
  if (client.y <= borderBox.top + quarterOfHeight) {
    return 'reorder-above';
  }
  // In the bottom 1/4: reorder-below
  // On the line = in the bottom 1/4 to give this zone a bit more space
  if (client.y >= borderBox.bottom - quarterOfHeight) {
    return 'reorder-below';
  }
  return 'make-child';
}

function getInstruction({
  element,
  input,
  currentLevel,
  indentPerLevel,
  mode,
}: {
  element: Element;
  input: Input;
  currentLevel: number;
  indentPerLevel: number;
  mode: ItemMode;
}): Instruction {
  const client: Position = {
    x: input.clientX,
    y: input.clientY,
  };

  const borderBox = element.getBoundingClientRect();
  if (mode === 'standard') {
    const type = standardHitbox({ borderBox, client });
    return { type, indentPerLevel, currentLevel };
  }
  const center: Position = getCenter(borderBox);

  if (mode === 'expanded') {
    // leveraging "standard" hitbox to ensure that the 'reorder-above' hit zone is
    // exactly the same for "standard" and "expanded" items
    const type = standardHitbox({ borderBox, client });
    return {
      // Use the "standard" hitbox for "reorder above",
      // The rest of the item is "make-child"
      type: type === 'reorder-above' ? type : 'make-child',
      indentPerLevel,
      currentLevel,
    };
  }

  // `mode` is "last-in-group"

  const visibleInset = indentPerLevel * currentLevel;

  // Before the left edge of the visible item
  if (client.x < borderBox.left + visibleInset) {
    // Above the center: `reorder-above`
    if (client.y < center.y) {
      return { type: 'reorder-above', indentPerLevel, currentLevel };
    }
    // On or below the center: `reparent`
    // On the center = `reparent` as we are giving a slightly bigger hitbox to this
    // action as it is the only place a user can do it
    const rawLevel = (client.x - borderBox.left) / indentPerLevel;
    // We can get sub pixel negative numbers as getBoundingClientRect gives sub-pixel accuracy,
    // where as clientX is rounded to the nearest pixel.
    // Using Math.max() ensures we can never get a negative level
    const desiredLevel = Math.max(Math.floor(rawLevel), 0);
    return {
      type: 'reparent',
      desiredLevel,
      indentPerLevel,
      currentLevel,
    };
  }
  // On the visible item
  return {
    type: standardHitbox({ borderBox, client }),
    indentPerLevel,
    currentLevel,
  };
}

function isShallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every(key => a[key] === b[key]);
}

function areInstructionsEqual(a: Instruction, b: Instruction): boolean {
  // Shortcut
  if (a.type !== b.type) {
    return false;
  }
  if (a.type === 'instruction-blocked' && b.type === 'instruction-blocked') {
    return areInstructionsEqual(a.desired, b.desired);
  }
  return isShallowEqual(a, b);
}

// Note: not using `memoize-one` as all we need is a cached value.
// We do not need to avoid executing an expensive function.
const memoizeInstruction = (() => {
  let last: Instruction | null = null;

  return (instruction: Instruction): Instruction => {
    if (last && areInstructionsEqual(last, instruction)) {
      return last;
    }
    last = instruction;
    return instruction;
  };
})();

function applyInstructionBlock({
  desired,
  block,
}: {
  desired: Instruction;
  block?: Instruction['type'][];
}): Instruction {
  if (block?.includes(desired.type) && desired.type !== 'instruction-blocked') {
    const blocked: Instruction = {
      type: 'instruction-blocked',
      desired,
    };
    return blocked;
  }

  return desired;
}

export function attachInstruction(
  userData: Record<string | symbol, unknown>,
  {
    block,
    ...rest
  }: Parameters<typeof getInstruction>[0] & {
    block?: Instruction['type'][];
  },
): Record<string | symbol, unknown> {
  const desired: Instruction = getInstruction(rest);
  const withBlock: Instruction = applyInstructionBlock({
    desired,
    block,
  });
  const memoized: Instruction = memoizeInstruction(withBlock);

  return {
    ...userData,
    [uniqueKey]: memoized,
  };
}

export function extractInstruction(
  userData: Record<string | symbol, unknown>,
): Instruction | null {
  return (userData[uniqueKey] as Instruction) ?? null;
}
