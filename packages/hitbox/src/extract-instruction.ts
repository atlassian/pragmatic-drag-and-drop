import { uniqueKey } from './tree-item';
import type { Instruction } from './tree-item';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function extractInstruction(userData: Record<string | symbol, unknown>): Instruction | null {
	return (userData[uniqueKey] as Instruction) ?? null;
}
