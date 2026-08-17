/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
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
export const uniqueKey: any = Symbol('tree-item-instruction');

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { attachInstruction } from './attach-instruction';
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports -- Disabled via Volt Codemod. Do not add more exports to this file.
export { extractInstruction } from './extract-instruction';
