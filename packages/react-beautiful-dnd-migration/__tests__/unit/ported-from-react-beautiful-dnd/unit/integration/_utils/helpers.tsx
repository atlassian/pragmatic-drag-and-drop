// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/util/helpers.js>

// eslint-disable-next-line import/no-extraneous-dependencies
import type { Position } from 'css-box-model';
import type {
  DraggableId,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  DropReason,
} from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { defaultItemRender, Item, RenderItem } from './app';

export function getOffset(el: HTMLElement): Position {
  const style: CSSStyleDeclaration = el.style;

  const transform: string = style.transform;
  if (!transform) {
    return { x: 0, y: 0 };
  }

  const regex: RegExp = /translate\((\d+)px, (\d+)px\)/;

  const result = transform.match(regex);
  invariant(result, `Unable to formate translate: ${transform}`);

  return {
    x: Number(result[1]),
    y: Number(result[2]),
  };
}

export function getDropReason(onDragEnd: jest.Mock): DropReason {
  const calls = onDragEnd.mock.calls;

  invariant(calls.length, 'There has been no calls to onDragEnd');

  return calls[0][0].reason;
}
export function isDragging(el: HTMLElement): boolean {
  return el.getAttribute('data-is-dragging') === 'true';
}

export function isDropAnimating(el: HTMLElement): boolean {
  return el.getAttribute('data-is-drop-animating') === 'true';
}

export function isCombining(el: HTMLElement): boolean {
  return el.getAttribute('data-is-combining') === 'true';
}

export function isCombineTarget(el: HTMLElement): boolean {
  return el.getAttribute('data-is-combine-target') === 'true';
}

export function isClone(el: HTMLElement): boolean {
  return el.getAttribute('data-is-clone') === 'true';
}

export function isOver(el: HTMLElement): string | null {
  const value: string | null = el.getAttribute('data-is-over');
  return value || null;
}

export const renderItemAndSpy =
  (mock: jest.Mock): RenderItem =>
  (item: Item) => {
    const render = defaultItemRender(item);
    return (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot,
      rubric: DraggableRubric,
    ) => {
      mock(provided, snapshot, rubric);
      return render(provided, snapshot, rubric);
    };
  };

export type Call = [DraggableProvided, DraggableStateSnapshot, DraggableRubric];

export const getCallsFor = (id: DraggableId, mock: jest.Mock): Call[] => {
  return mock.mock.calls.filter(call => {
    const provided: DraggableProvided = call[0];
    return provided.draggableProps['data-rbd-draggable-id'] === id;
  });
};

export const getProvidedFor = (
  id: DraggableId,
  mock: jest.Mock,
): DraggableProvided[] => {
  return getCallsFor(id, mock).map(call => {
    return call[0];
  });
};

export const getSnapshotsFor = (
  id: DraggableId,
  mock: jest.Mock,
): DraggableStateSnapshot[] => {
  return getCallsFor(id, mock).map(call => {
    return call[1];
  });
};

export const getRubricsFor = (
  id: DraggableId,
  mock: jest.Mock,
): DraggableRubric[] => {
  return getCallsFor(id, mock).map(call => {
    return call[2];
  });
};

export function getLast<T>(values: T[]): T | null {
  return values[values.length - 1] || null;
}

export const atRest: DraggableStateSnapshot = {
  isClone: false,
  isDragging: false,
  isDropAnimating: false,
  dropAnimation: null,
  draggingOver: null,
  combineWith: null,
  combineTargetFor: null,
  mode: null,
};
