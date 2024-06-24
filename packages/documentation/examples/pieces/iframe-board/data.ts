import type { ExternalDragPayload } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';

import { type Person } from '../../data/people';

const cardKey = Symbol('card');
export type TCard = {
	cardId: string;
	columnId: string;
	[cardKey]: true;
};

export function getCard({ cardId, columnId }: { cardId: string; columnId: string }): TCard {
	return {
		cardId,
		columnId,
		[cardKey]: true,
	};
}

export function isCard(data: Record<string | symbol, unknown>): data is TCard {
	return data[cardKey] === true;
}

const columnDropTargetKey = Symbol('column-drop-target');
export type TColumnDropTarget = {
	columnId: string;
	[columnDropTargetKey]: true;
};

export function getColumnDropTarget({ columnId }: { columnId: string }): TColumnDropTarget {
	return {
		columnId,
		[columnDropTargetKey]: true,
	};
}

export function isColumnDropTarget(
	data: Record<string | symbol, unknown>,
): data is TColumnDropTarget {
	return data[columnDropTargetKey] === true;
}

const cardDropTargetKey = Symbol('card-drop-target');
export type TCardDropTarget = {
	cardId: string;
	columnId: string;
	[cardDropTargetKey]: true;
};

export function getCardDropTarget({
	cardId,
	columnId,
}: {
	cardId: string;
	columnId: string;
}): TCardDropTarget {
	return {
		cardId,
		columnId,
		[cardDropTargetKey]: true,
	};
}

export function isCardDropTarget(data: Record<string | symbol, unknown>): data is TCardDropTarget {
	return data[cardDropTargetKey] === true;
}

// not exporting directly. Can only be accessed through helpers
const externalCardMediaType = 'application/x.card';

export function getCardDataForExternal(person: Person) {
	if (!isAndroid()) {
		return {
			[externalCardMediaType]: person.userId,
			// bonus: data for external applications
			['text/plain']: `${person.name}: ${person.role}`,
			['text/uri-list']: window.location.href,
		};
	}

	// Note: for a production application, you might want to consider
	// adding a value to `localStorage` as a way to communicate _what_
	// is dragging across iframes for Android as a few different things
	// _could_ trigger a text drag.
	return {
		[externalCardMediaType]: person.userId, // being hopeful
		['text/plain']: person.userId,
	};
}

export const dropHandledExternallyLocalStorageKey = 'card-drop-handled-externally';

function isAndroid(): boolean {
	return navigator.userAgent.toLocaleLowerCase().includes('android');
}

export function isDraggingExternalCard({ source }: { source: ExternalDragPayload }): boolean {
	if (source.types.includes(externalCardMediaType)) {
		return true;
	}
	// custom data types not available on android
	if (isAndroid() && source.types.includes('text/plain')) {
		return true;
	}
	return false;
}

export function getDroppedExternalCardId({
	source,
}: {
	source: ExternalDragPayload;
}): string | null {
	if (!isAndroid()) {
		return source.getStringData(externalCardMediaType);
	}

	// fallback for android
	return source.getStringData('text/plain');
}
