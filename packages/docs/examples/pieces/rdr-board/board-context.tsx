import { createContext, useContext } from 'react';

import invariant from 'tiny-invariant';

import type { ColumnType } from './data';

export type BoardContextProps = {
  getColumns: () => ColumnType[];

  reorderColumn: (args: { startIndex: number; finishIndex: number }) => void;

  reorderCard: (args: {
    columnId: string;
    startIndex: number;
    finishIndex: number;
  }) => void;

  moveCard: (args: {
    startColumnId: string;
    finishColumnId: string;
    itemIndexInStartColumn: number;
    itemIndexInFinishColumn?: number;
  }) => void;

  registerCard: (args: {
    cardId: string;
    actionMenuTrigger: HTMLElement;
    isSelected: boolean;
  }) => void;

  getSelectedCards: () => string[];
};

export const BoardContext = createContext<BoardContextProps | null>(null);

export function useBoardContext(): BoardContextProps {
  const value = useContext(BoardContext);
  invariant(value, 'cannot find BoardContext provider');
  return value;
}
