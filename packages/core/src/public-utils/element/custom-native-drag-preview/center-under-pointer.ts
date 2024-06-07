import type { GetOffsetFn } from './types';

export const centerUnderPointer: GetOffsetFn = function centerUnderPointer({ container }) {
	const rect = container.getBoundingClientRect();
	return { x: rect.width / 2, y: rect.height / 2 };
};
