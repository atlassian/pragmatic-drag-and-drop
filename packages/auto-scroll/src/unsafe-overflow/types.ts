import type { AllDragTypes } from '@atlaskit/pragmatic-drag-and-drop/types';

import { type Edge, type ElementAutoScrollArgs, type Spacing } from '../internal-types';

type VerticalEdges = ['top' | 'bottom'];
type HorizontalEdges = ['left' | 'right'];
type CrossAxisEdges<T extends Edge> = T extends VerticalEdges[number]
	? HorizontalEdges
	: VerticalEdges;

/** Specify outward reach of a scroll container */
export type HitboxSpacing = {
	[TEdge in keyof Spacing]: Spacing;
};

/** The public type for specifying the outward reach of a scroll container */
export type ProvidedHitboxSpacing = {
	[TEdge in keyof Spacing as `for${Capitalize<TEdge>}Edge`]?: {
		// Allow
		// Example for "top" edge: { top: 5 }
		[TKey in TEdge]: number;
	} & {
		// Optional edges for the cross axis
		// Example for "top" edge: {top: 5, left: 1, right: 2}
		[TKey in CrossAxisEdges<TEdge>[number]]?: number;
	};
	// Disallowing (by not including) the opposite edge.
	// Example for "top" edge: {top: 5, bottom: 2} is not allowed
};

export type UnsafeOverflowAutoScrollArgs<DragType extends AllDragTypes> =
	ElementAutoScrollArgs<DragType> & {
		getOverflow: () => ProvidedHitboxSpacing;
	};
