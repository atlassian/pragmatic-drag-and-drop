import { uniqueKey } from './list-item';
import type { Instruction } from './list-item';

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
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function extractInstruction(userData: Record<string | symbol, unknown>): Instruction | null {
	return (userData[uniqueKey] as Instruction) ?? null;
}
