import type { AllDragTypes } from '@atlaskit/pragmatic-drag-and-drop/types';

import { Edge, ElementAutoScrollArgs, Spacing } from '../internal-types';

type OppositeSide<T extends Edge> = T extends 'top'
  ? 'bottom'
  : T extends 'bottom'
  ? 'top'
  : T extends 'left'
  ? 'right'
  : T extends 'right'
  ? 'left'
  : never;

/** Specify outward reach of a scroll container */
export type HitboxSpacing = {
  [TEdge in keyof Spacing]: Spacing;
};

/** The public type for specifying the outward reach of a scroll container */
export type ProvidedHitboxSpacing = {
  [TEdge in keyof Spacing as `from${Capitalize<TEdge>}Edge`]?: Omit<
    Spacing,
    OppositeSide<TEdge>
  >;
};

export type UnsafeOverflowAutoScrollArgs<DragType extends AllDragTypes> =
  ElementAutoScrollArgs<DragType> & {
    getOverflow: () => ProvidedHitboxSpacing;
  };
