import type { Input } from '@atlaskit/pragmatic-drag-and-drop/types';

import {
  attachInstruction,
  extractInstruction,
  Instruction,
} from '../../src/tree-item';

import { getDefaultInput, getElements, getRect } from './_util';

const rect = getRect({
  top: 0,
  left: 0,
  right: 100,
  bottom: 100,
});

const [element] = getElements();
element.getBoundingClientRect = () => rect;

it('should return the same instruction reference when the instruction has not changed', () => {
  const expected: Instruction = {
    type: 'reorder-above',
    currentLevel: 0,
    indentPerLevel: 20,
  };

  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  expect(first).toEqual(expected);

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top + 1,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  expect(second).toEqual(expected);
  // expecting reference to match
  expect(first).toBe(second);

  // mode is changing, but will still be in the 'reorder-above' hitzone
  const third = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'expanded',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top + 2,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  expect(third).toEqual(expected);
  // expecting reference to match
  expect(first).toBe(third);
});

it('should return a new instruction when the instruction changes based on a hitzone change', () => {
  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input: getDefaultInput({
          clientY: rect.top,
          clientX: rect.left,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-above',
      currentLevel: 0,
      indentPerLevel: 20,
    };
    expect(first).toEqual(expected);
  }

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // change in input, will be in 'reorder-bottom' zone
        input: getDefaultInput({
          clientY: rect.bottom,
          clientX: rect.left,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-below',
      currentLevel: 0,
      indentPerLevel: 20,
    };
    expect(second).toEqual(expected);
    // second is a new object
    expect(second).not.toBe(first);
  }
});

it('should return a new instruction if the indentPerLevel changes', () => {
  const input: Input = getDefaultInput({
    clientY: rect.top,
    clientX: rect.left,
  });
  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input,
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-above',
      currentLevel: 0,
      indentPerLevel: 20,
    };
    expect(first).toEqual(expected);
  }

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // no change in input
        input,
        currentLevel: 0,
        // indent per level has changed
        indentPerLevel: 30,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-above',
      currentLevel: 0,
      indentPerLevel: 30,
    };
    expect(second).toEqual(expected);
    // second is a new object
    expect(second).not.toBe(first);
  }
});

it('should return a new instruction if the currentLevel changes', () => {
  const input: Input = getDefaultInput({
    clientY: rect.top,
    clientX: rect.left,
  });
  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input,
        currentLevel: 0,
        indentPerLevel: 20,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-above',
      currentLevel: 0,
      indentPerLevel: 20,
    };
    expect(first).toEqual(expected);
  }

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // no change in input
        input,
        // current level has changed
        currentLevel: 1,
        indentPerLevel: 20,
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'reorder-above',
      currentLevel: 1,
      indentPerLevel: 20,
    };
    expect(second).toEqual(expected);
    // second is a new object
    expect(second).not.toBe(first);
  }
});

it('should return the same instruction reference when the instruction has not changed for blocked instructions', () => {
  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        block: ['reorder-above'],
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'instruction-blocked',
      desired: {
        type: 'reorder-above',
        currentLevel: 0,
        indentPerLevel: 20,
      },
    };
    expect(first).toEqual(expected);
  }

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top + 1,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        block: ['reorder-above'],
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'instruction-blocked',
      desired: {
        type: 'reorder-above',
        currentLevel: 0,
        indentPerLevel: 20,
      },
    };
    expect(first).toEqual(expected);
    // expecting reference to match
    expect(first).toBe(second);
  }

  // mode is changing, but will still be in the 'reorder-above' hitzone
  const third = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'expanded',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top + 2,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        block: ['reorder-above'],
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'instruction-blocked',
      desired: {
        type: 'reorder-above',
        currentLevel: 0,
        indentPerLevel: 20,
      },
    };
    expect(first).toEqual(expected);
    // expecting reference to match
    expect(first).toBe(third);
  }
});

it('should return a new instruction reference if it is no longer blocked', () => {
  const desired: Instruction = {
    type: 'reorder-above',
    currentLevel: 0,
    indentPerLevel: 20,
  };
  const first = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        block: ['reorder-above'],
      },
    ),
  );

  {
    const expected: Instruction = {
      type: 'instruction-blocked',
      desired: desired,
    };
    expect(first).toEqual(expected);
  }

  const second = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        // block gone
      },
    ),
  );

  expect(second).toEqual(desired);
  // expecting reference not to match
  expect(first).not.toBe(second);

  // checking that memoization is now kicking in
  const third = extractInstruction(
    attachInstruction(
      {},
      {
        element,
        mode: 'standard',
        // change in input, but still in the 'standard' zone
        input: getDefaultInput({
          clientX: rect.left,
          clientY: rect.top,
        }),
        currentLevel: 0,
        indentPerLevel: 20,
        // block gone
      },
    ),
  );

  expect(third).toEqual(desired);
  // expecting reference to match
  expect(second).toBe(third);
});

describe('reparenting', () => {
  it('should return the same instruction reference when the instruction has not changed', () => {
    const indentPerLevel = 20;
    const currentLevel = 2;
    const desiredLevel = 1;
    const expected: Instruction = {
      type: 'reparent',
      currentLevel,
      indentPerLevel,
      desiredLevel,
    };

    const first = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          input: getDefaultInput({
            clientY: rect.bottom,
            clientX: rect.left + indentPerLevel * desiredLevel,
          }),
          currentLevel: currentLevel,
          indentPerLevel: indentPerLevel,
        },
      ),
    );

    expect(first).toEqual(expected);

    const second = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          // change in input, but still in the same zone
          input: getDefaultInput({
            clientY: rect.bottom,
            clientX: rect.left + indentPerLevel * desiredLevel + 1,
          }),
          currentLevel: currentLevel,
          indentPerLevel: indentPerLevel,
        },
      ),
    );

    expect(second).toEqual(expected);
    // expecting reference to match
    expect(first).toBe(second);
  });

  it('should return a new instruction if the desiredLevel changes', () => {
    const indentPerLevel = 20;
    const currentLevel = 2;
    const firstDesiredLevel = 1;
    const secondDesiredLevel = 0;
    const first = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          input: getDefaultInput({
            clientY: rect.bottom,
            clientX: rect.left + indentPerLevel * firstDesiredLevel,
          }),
          currentLevel,
          indentPerLevel,
        },
      ),
    );

    {
      const expected: Instruction = {
        type: 'reparent',
        desiredLevel: firstDesiredLevel,
        currentLevel,
        indentPerLevel,
      };
      expect(first).toEqual(expected);
    }

    const second = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          input: getDefaultInput({
            clientY: rect.bottom,
            clientX: rect.left + indentPerLevel * secondDesiredLevel,
          }),
          currentLevel,
          indentPerLevel,
        },
      ),
    );

    {
      const expected: Instruction = {
        type: 'reparent',
        desiredLevel: secondDesiredLevel,
        currentLevel,
        indentPerLevel,
      };
      expect(second).toEqual(expected);
      // second is a new object
      expect(second).not.toBe(first);
    }
  });

  it('should return the same instruction reference for blocked reparent instructions', () => {
    const indentPerLevel = 20;
    const currentLevel = 2;
    const desiredLevel = 1;
    const expected: Instruction = {
      type: 'instruction-blocked',
      desired: {
        type: 'reparent',
        currentLevel,
        indentPerLevel,
        desiredLevel: desiredLevel,
      },
    };
    const first = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          input: getDefaultInput({
            clientX: rect.left + indentPerLevel * desiredLevel,
            clientY: rect.bottom,
          }),
          currentLevel,
          indentPerLevel,
          block: ['reparent'],
        },
      ),
    );

    expect(first).toEqual(expected);

    const second = extractInstruction(
      attachInstruction(
        {},
        {
          element,
          mode: 'last-in-group',
          input: getDefaultInput({
            clientX: rect.left + indentPerLevel * desiredLevel + 1,
            clientY: rect.bottom,
          }),
          currentLevel,
          indentPerLevel,
          block: ['reparent'],
        },
      ),
    );

    expect(second).toEqual(expected);
    // same reference
    expect(first).toBe(second);
  });
});
