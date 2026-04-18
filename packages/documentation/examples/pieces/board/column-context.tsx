import { createContext, useContext, type Context } from 'react';

import invariant from 'tiny-invariant';

export type ColumnContextProps = {
	columnId: string;
	getCardIndex: (userId: string) => number;
	getNumCards: () => number;
};

export const ColumnContext: Context<ColumnContextProps | null> = createContext<ColumnContextProps | null>(null);

export function useColumnContext(): ColumnContextProps {
	const value = useContext(ColumnContext);
	invariant(value, 'cannot find ColumnContext provider');
	return value;
}
