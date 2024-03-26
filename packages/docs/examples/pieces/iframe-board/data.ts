const cardKey = Symbol('card');
export type TCard = {
  cardId: string;
  columnId: string;
  [cardKey]: true;
};

export function getCard({
  cardId,
  columnId,
}: {
  cardId: string;
  columnId: string;
}): TCard {
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

export function getColumnDropTarget({
  columnId,
}: {
  columnId: string;
}): TColumnDropTarget {
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

export function isCardDropTarget(
  data: Record<string | symbol, unknown>,
): data is TCardDropTarget {
  return data[cardDropTargetKey] === true;
}

export const externalCardMediaType = 'application/x.card';

export const dropHandledExternallyLocalStorageKey =
  'card-drop-handled-externally';
