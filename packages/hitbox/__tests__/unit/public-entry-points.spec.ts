import { attachClosestEdge as attachClosestEdgeFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge';
import { extractClosestEdge as extractClosestEdgeFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge';
import { attachInstruction as attachListInstructionFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item/attach-instruction';
import { extractInstruction as extractListInstructionFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item/extract-instruction';
import { attachInstruction as attachTreeInstructionFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item/attach-instruction';
import { extractInstruction as extractTreeInstructionFromEntryPoint } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item/extract-instruction';

import { attachClosestEdge } from '../../src/attach-closest-edge';
import { extractClosestEdge } from '../../src/extract-closest-edge';
import { attachInstruction as attachListInstruction } from '../../src/attach-instruction-2';
import { extractInstruction as extractListInstruction } from '../../src/extract-instruction-2';
import { attachInstruction as attachTreeInstruction } from '../../src/attach-instruction';
import { extractInstruction as extractTreeInstruction } from '../../src/extract-instruction';

describe('public entry points', () => {
	it('exposes each function extracted from a public boundary', () => {
		expect(attachClosestEdgeFromEntryPoint).toBe(attachClosestEdge);
		expect(extractClosestEdgeFromEntryPoint).toBe(extractClosestEdge);
		expect(attachListInstructionFromEntryPoint).toBe(attachListInstruction);
		expect(extractListInstructionFromEntryPoint).toBe(extractListInstruction);
		expect(attachTreeInstructionFromEntryPoint).toBe(attachTreeInstruction);
		expect(extractTreeInstructionFromEntryPoint).toBe(extractTreeInstruction);
	});
});
