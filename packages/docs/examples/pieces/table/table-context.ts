import { createContext } from 'react';

import type { Item, ItemRegistration, ReorderFunction } from './types';

type UnregisterFn = () => void;

export type ItemContextValue = {
  getItemsForColumnPreview: () => {
    items: Item[];
    isMoreItems: boolean;
  };
  reorderColumn: ReorderFunction;
  reorderItem: ReorderFunction;
  register: (args: ItemRegistration) => UnregisterFn;
  instanceId: symbol | null;
};
export const TableContext = createContext<ItemContextValue>({
  getItemsForColumnPreview: () => ({ items: [], isMoreItems: false }),
  reorderColumn: () => {},
  reorderItem: () => {},
  register: function register() {
    return function unregister() {};
  },
  instanceId: null,
});
