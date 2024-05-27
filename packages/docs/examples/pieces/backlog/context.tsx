import { createContext, useContext } from 'react';

import invariant from 'tiny-invariant';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import { type ItemData } from './data';

type ItemPosition = 'first' | 'last' | 'middle' | 'only';

type CleanupFn = () => void;

type ListContextProps = {
  getItemIndex: ({ id }: { id: string }) => number;
  getItemPosition: (itemData: ItemData) => ItemPosition;
  registerItem: (args: { id: string; element: HTMLElement }) => CleanupFn;
  reorderItem: (args: {
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
  }) => void;
};

export const ListContext = createContext<ListContextProps | null>(null);

export function useListContext() {
  const listContext = useContext(ListContext);
  invariant(listContext !== null);
  return listContext;
}
