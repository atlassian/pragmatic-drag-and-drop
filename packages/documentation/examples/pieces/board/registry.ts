import invariant from 'tiny-invariant';

import type { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

export type CardEntry = {
	element: HTMLElement;
	actionMenuTrigger: HTMLElement;
};

export type ColumnEntry = {
	element: HTMLElement;
};

/**
 * Registering cards and their action menu trigger element,
 * so that we can restore focus to the trigger when a card moves between columns.
 */
export function createRegistry() {
	const cards = new Map<string, CardEntry>();
	const columns = new Map<string, ColumnEntry>();

	function registerCard({ cardId, entry }: { cardId: string; entry: CardEntry }): CleanupFn {
		cards.set(cardId, entry);
		return function cleanup() {
			cards.delete(cardId);
		};
	}

	function registerColumn({
		columnId,
		entry,
	}: {
		columnId: string;
		entry: ColumnEntry;
	}): CleanupFn {
		columns.set(columnId, entry);
		return function cleanup() {
			cards.delete(columnId);
		};
	}

	function getCard(cardId: string): CardEntry {
		const entry = cards.get(cardId);
		invariant(entry);
		return entry;
	}

	function getColumn(columnId: string): ColumnEntry {
		const entry = columns.get(columnId);
		invariant(entry);
		return entry;
	}

	return { registerCard, registerColumn, getCard, getColumn };
}
