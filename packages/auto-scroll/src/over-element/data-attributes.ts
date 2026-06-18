import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

export const dataAttribute = 'data-auto-scrollable';
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const selector: '[data-auto-scrollable="true"]' = `[${dataAttribute}="true"]`;

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function addScrollableAttribute(element: Element): CleanupFn {
	element.setAttribute(dataAttribute, 'true');
	return () => element.removeAttribute(dataAttribute);
}
