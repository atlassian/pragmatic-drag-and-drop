import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  ElementEventPayloadMap,
  monitorForElements,
} from '../../../src/entry-point/element/adapter';
import {
  DragLocationHistory,
  DropTargetRecord,
} from '../../../src/entry-point/types';
import {
  appendToBody,
  getBubbleOrderedTree,
  getDefaultInput,
  reset,
} from '../_util';

afterEach(reset);

function getLookup() {
  const storage = new Map<keyof ElementEventPayloadMap, DragLocationHistory>();

  function get(key: keyof ElementEventPayloadMap): DragLocationHistory {
    const value = storage.get(key);
    invariant(value, `Could not get value with key (${key}) from map`);
    return value;
  }

  function set(
    key: keyof ElementEventPayloadMap,
    location: DragLocationHistory,
  ): void {
    invariant(!storage.has(key), `Unexpected write to used key (${key})`);
    storage.set(key, location);
  }

  return { set, get };
}

test('Scenario: ([B,A] -> cancel)', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const lookup = getLookup();

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
    }),
    dropTargetForElements({
      element: B,
    }),
    dropTargetForElements({
      element: A,
    }),
    monitorForElements({
      onGenerateDragPreview: ({ location }) => {
        ordered.push('monitor:preview');
        lookup.set('onGenerateDragPreview', location);
      },
      onDragStart: ({ location }) => {
        ordered.push('monitor:start');
        lookup.set('onDragStart', location);
      },
      onDrag: ({ location }) => {
        ordered.push('monitor:drag');
        lookup.set('onDrag', location);
      },
      onDropTargetChange: ({ location }) => {
        ordered.push('monitor:change');
        lookup.set('onDropTargetChange', location);
      },
      onDrop: ({ location }) => {
        ordered.push('monitor:drop');
        lookup.set('onDrop', location);
      },
    }),
  );

  // Lift [A]
  const liftInput = getDefaultInput({ clientX: 1 });
  fireEvent.dragStart(draggableEl, liftInput);

  const initial: DropTargetRecord[] = [
    {
      element: B,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
    {
      element: A,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
  ];
  const liftExpected: DragLocationHistory = {
    initial: {
      input: liftInput,
      dropTargets: initial,
    },
    previous: {
      dropTargets: [],
    },
    current: {
      input: liftInput,
      dropTargets: initial,
    },
  };
  expect(ordered).toEqual(['monitor:preview']);
  expect(lookup.get('onGenerateDragPreview')).toEqual(liftExpected);
  ordered.length = 0;

  // complete lift
  // @ts-expect-error
  requestAnimationFrame.step();

  expect(ordered).toEqual(['monitor:start']);
  // `onGenerateDragPreview` and `onDragStart` get the same previous / current values
  expect(lookup.get('onDragStart')).toEqual(liftExpected);
  // they even have the same reference
  expect(lookup.get('onGenerateDragPreview')).toBe(lookup.get('onDragStart'));
  ordered.length = 0;

  // [B, A] -> cancel (part 1: dragleave)
  const leaveInput = getDefaultInput({ clientX: 3 });
  fireEvent.dragLeave(A, leaveInput);

  const leaveAExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: lookup.get('onDragStart').current.dropTargets,
    },
    current: {
      input: liftInput,
      // over nothing now
      dropTargets: [],
    },
  };
  expect(ordered).toEqual(['monitor:change']);
  // value is what we expect
  expect(lookup.get('onDropTargetChange')).toEqual(leaveAExpected);
  // previous points to last current
  expect(lookup.get('onDropTargetChange').previous.dropTargets).toBe(
    lookup.get('onDragStart').current.dropTargets,
  );
  ordered.length = 0;

  // [A] -> cancel (part 2: dragend)
  const dragEndInput = getDefaultInput({ clientX: 4 });
  fireEvent.dragEnd(A, dragEndInput);

  const dropExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: [],
    },
    current: {
      // new input won't be taken
      input: liftInput,
      // over nothing now
      dropTargets: [],
    },
  };
  expect(ordered).toEqual(['monitor:drop']);
  // value is what we expect
  expect(lookup.get('onDrop')).toEqual(dropExpected);
  // previous points to last current
  expect(lookup.get('onDrop').previous.dropTargets).toBe(
    lookup.get('onDropTargetChange').current.dropTargets,
  );

  cleanup();
});

test('Scenario: ([B,A] -> [B,A] -> [A] -> drop)', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const lookup = getLookup();

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
    }),
    dropTargetForElements({
      element: B,
    }),
    dropTargetForElements({
      element: A,
    }),
    monitorForElements({
      onGenerateDragPreview: ({ location }) => {
        ordered.push('monitor:preview');
        lookup.set('onGenerateDragPreview', location);
      },
      onDragStart: ({ location }) => {
        ordered.push('monitor:start');
        lookup.set('onDragStart', location);
      },
      onDrag: ({ location }) => {
        ordered.push('monitor:drag');
        lookup.set('onDrag', location);
      },
      onDropTargetChange: ({ location }) => {
        ordered.push('monitor:change');
        lookup.set('onDropTargetChange', location);
      },
      onDrop: ({ location }) => {
        ordered.push('monitor:drop');
        lookup.set('onDrop', location);
      },
    }),
  );

  // Lift [A]
  const liftInput = getDefaultInput({ clientX: 1 });
  fireEvent.dragStart(draggableEl, liftInput);

  const initial: DropTargetRecord[] = [
    {
      element: B,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
    {
      element: A,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
  ];
  const liftExpected: DragLocationHistory = {
    initial: {
      input: liftInput,
      dropTargets: initial,
    },
    previous: {
      dropTargets: [],
    },
    current: {
      input: liftInput,
      dropTargets: initial,
    },
  };
  expect(ordered).toEqual(['monitor:preview']);
  expect(lookup.get('onGenerateDragPreview')).toEqual(liftExpected);
  ordered.length = 0;

  // complete lift
  // @ts-expect-error
  requestAnimationFrame.step();

  expect(ordered).toEqual(['monitor:start']);
  expect(lookup.get('onDragStart')).toEqual(liftExpected);
  ordered.length = 0;

  // Continue moving over [B, A]
  // [B, A] -> [B, A]
  const moveInput = getDefaultInput({ clientX: 2 });
  fireEvent.dragOver(B, moveInput);

  expect(ordered.length).toBe(0);

  // flush drag event
  // @ts-expect-error
  requestAnimationFrame.step();

  const moveExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: liftExpected.current.dropTargets,
    },
    current: {
      input: moveInput,
      dropTargets: liftExpected.initial.dropTargets,
    },
  };
  expect(ordered).toEqual(['monitor:drag']);
  // value is what we expect
  expect(lookup.get('onDrag')).toEqual(moveExpected);
  // previous points to last current
  expect(lookup.get('onDrag').previous.dropTargets).toBe(
    lookup.get('onDragStart').current.dropTargets,
  );
  ordered.length = 0;

  // [B, A] -> [A]
  const enterAInput = getDefaultInput({ clientX: 3 });
  fireEvent.dragEnter(A, enterAInput);

  const enterAExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: lookup.get('onDrag').current.dropTargets,
    },
    current: {
      input: enterAInput,
      // only over [A] now
      dropTargets: [liftExpected.initial.dropTargets[1]],
    },
  };
  expect(ordered).toEqual(['monitor:change']);
  // value is what we expect
  expect(lookup.get('onDropTargetChange')).toEqual(enterAExpected);
  // previous points to last current
  expect(lookup.get('onDropTargetChange').previous.dropTargets).toBe(
    lookup.get('onDrag').current.dropTargets,
  );
  ordered.length = 0;

  // [A] -> drop
  const dropInput = getDefaultInput({ clientX: 4 });
  fireEvent.drop(A, dropInput);

  const dropExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: lookup.get('onDropTargetChange').current.dropTargets,
    },
    current: {
      // new input won't be taken
      input: enterAInput,
      // only over [A] now
      dropTargets: [liftExpected.initial.dropTargets[1]],
    },
  };
  expect(ordered).toEqual(['monitor:drop']);
  // value is what we expect
  expect(lookup.get('onDrop')).toEqual(dropExpected);
  // previous points to last current
  expect(lookup.get('onDrop').previous.dropTargets).toBe(
    lookup.get('onDropTargetChange').current.dropTargets,
  );

  cleanup();
});

test('Scenario: ([B, A] -> drop (lift flush)', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const lookup = getLookup();

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
    }),
    dropTargetForElements({
      element: B,
    }),
    dropTargetForElements({
      element: A,
    }),
    monitorForElements({
      onGenerateDragPreview: ({ location }) => {
        ordered.push('monitor:preview');
        lookup.set('onGenerateDragPreview', location);
      },
      onDragStart: ({ location }) => {
        ordered.push('monitor:start');
        lookup.set('onDragStart', location);
      },
      onDrag: ({ location }) => {
        ordered.push('monitor:drag');
        lookup.set('onDrag', location);
      },
      onDropTargetChange: ({ location }) => {
        ordered.push('monitor:change');
        lookup.set('onDropTargetChange', location);
      },
      onDrop: ({ location }) => {
        ordered.push('monitor:drop');
        lookup.set('onDrop', location);
      },
    }),
  );

  // Lift [A]
  const liftInput = getDefaultInput({ clientX: 1 });
  fireEvent.dragStart(draggableEl, liftInput);

  const initial: DropTargetRecord[] = [
    {
      element: B,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
    {
      element: A,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
  ];
  const liftExpected: DragLocationHistory = {
    initial: {
      input: liftInput,
      dropTargets: initial,
    },
    previous: {
      dropTargets: [],
    },
    current: {
      input: liftInput,
      dropTargets: initial,
    },
  };
  expect(ordered).toEqual(['monitor:preview']);
  expect(lookup.get('onGenerateDragPreview')).toEqual(liftExpected);
  ordered.length = 0;

  // "drop" on B before `onDragStart` was triggered in the next animation frame
  const dropInput = getDefaultInput({ clientX: 4 });
  fireEvent.drop(B, dropInput);

  expect(ordered).toEqual(['monitor:start', 'monitor:drop']);
  // `onGenerateDragPreview` and `onDragStart` get the same previous / current values
  expect(lookup.get('onDragStart')).toEqual(liftExpected);
  // they even have the same reference
  expect(lookup.get('onGenerateDragPreview')).toBe(lookup.get('onDragStart'));

  const dropExpected: DragLocationHistory = {
    initial: liftExpected.initial,
    previous: {
      dropTargets: lookup.get('onDragStart').current.dropTargets,
    },
    current: {
      // new input for drop won't be taken
      input: liftInput,
      dropTargets: lookup.get('onDragStart').current.dropTargets,
    },
  };
  expect(lookup.get('onDrop')).toEqual(dropExpected);
  // previous points to last current
  expect(lookup.get('onDrop').previous.dropTargets).toBe(
    lookup.get('onDragStart').current.dropTargets,
  );

  cleanup();
});

test('Scenario: ([B, A] -> [B, A] (onDrag canceled by enter into) -> [A]', () => {
  const [draggableEl, B, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const lookup = getLookup();

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
    }),
    dropTargetForElements({
      element: B,
    }),
    dropTargetForElements({
      element: A,
    }),
    monitorForElements({
      onGenerateDragPreview: ({ location }) => {
        ordered.push('monitor:preview');
        lookup.set('onGenerateDragPreview', location);
      },
      onDragStart: ({ location }) => {
        ordered.push('monitor:start');
        lookup.set('onDragStart', location);
      },
      onDrag: ({ location }) => {
        ordered.push('monitor:drag');
        lookup.set('onDrag', location);
      },
      onDropTargetChange: ({ location }) => {
        ordered.push('monitor:change');
        lookup.set('onDropTargetChange', location);
      },
      onDrop: ({ location }) => {
        ordered.push('monitor:drop');
        lookup.set('onDrop', location);
      },
    }),
  );

  // Lift [B, A]
  const liftInput = getDefaultInput({ clientX: 1 });
  fireEvent.dragStart(draggableEl, liftInput);

  const initial: DropTargetRecord[] = [
    {
      element: B,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
    {
      element: A,
      isActiveDueToStickiness: false,
      data: {},
      dropEffect: 'move',
    },
  ];
  const liftExpected: DragLocationHistory = {
    initial: {
      input: liftInput,
      dropTargets: initial,
    },
    previous: {
      dropTargets: [],
    },
    current: {
      input: liftInput,
      dropTargets: initial,
    },
  };
  expect(ordered).toEqual(['monitor:preview']);
  expect(lookup.get('onGenerateDragPreview')).toEqual(liftExpected);
  ordered.length = 0;

  // complete lift
  // @ts-expect-error
  requestAnimationFrame.step();

  expect(ordered).toEqual(['monitor:start']);
  // `onGenerateDragPreview` and `onDragStart` get the same previous / current values
  expect(lookup.get('onDragStart')).toEqual(liftExpected);
  // they even have the same reference
  expect(lookup.get('onGenerateDragPreview')).toBe(lookup.get('onDragStart'));
  ordered.length = 0;

  const overInput = getDefaultInput({ clientX: 2 });
  fireEvent.dragOver(B, overInput);

  // "onDrag" not executed yet yet
  expect(ordered.length).toBe(0);

  // cancelling "onDrag" by entering into A
  const enterAInput = getDefaultInput({ clientX: 3 });
  fireEvent.dragEnter(A, enterAInput);
  expect(ordered).toEqual(['monitor:change']);
  const enterAExpected: DragLocationHistory = {
    initial: {
      input: liftInput,
      dropTargets: initial,
    },
    previous: {
      // last published event
      dropTargets: lookup.get('onDragStart').current.dropTargets,
    },
    current: {
      input: enterAInput,
      dropTargets: [initial[1]],
    },
  };
  // value is what we expect
  expect(lookup.get('onDropTargetChange')).toEqual(enterAExpected);
  // `previous` pointing to last published event's `current`
  expect(lookup.get('onDropTargetChange').previous.dropTargets).toEqual(
    lookup.get('onDragStart').current.dropTargets,
  );

  cleanup();
});
