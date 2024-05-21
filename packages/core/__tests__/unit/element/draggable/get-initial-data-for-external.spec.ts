import { fireEvent } from '@testing-library/dom';

import { elementAdapterNativeDataKey } from '../../../../src/adapter/element-adapter-native-data-key';
import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
} from '../../../../src/entry-point/element/adapter';
import { type Input } from '../../../../src/entry-point/types';
import {
  appendToBody,
  getBubbleOrderedTree,
  getDefaultInput,
  getElements,
  userEvent,
} from '../../_util';

afterEach(() => {
  // cleanup any pending drags
  fireEvent.dragEnd(window);
});

it('should be able to add data to the native store', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: A,
      getInitialData: () => ({ message: 'Own data' }),
      getInitialDataForExternal: () => ({
        'text/plain': 'External data',
      }),
      onDragStart: () => ordered.push('draggable:start'),
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('target(element):start'),
    }),
  );

  const start = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
  });
  A.dispatchEvent(start);

  // native data attached to event
  expect(start.dataTransfer?.types).toEqual([
    // our default type
    elementAdapterNativeDataKey,
    // the newly added type
    'text/plain',
  ]);
  expect(ordered).toEqual(['draggable:preview']);
  ordered.length = 0;

  // finish the lift
  // @ts-expect-error
  requestAnimationFrame.step();

  expect(ordered).toEqual(['draggable:start', 'target(element):start']);

  // checking we can get the external data when a drop occurs
  const drop = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
  });
  A.dispatchEvent(drop);

  expect(start.dataTransfer?.getData('text/plain')).toBe('External data');

  cleanup();
});

it('should only collect native data once during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const ordered: string[] = [];
  const getInitialDataForExternal = jest
    .fn()
    .mockImplementation(() => ({ 'text/plain': 'Alex' }));
  const firstInput: Input = {
    ...getDefaultInput(),
    pageX: 5,
  };
  const cleanup = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
    }),
    draggable({
      element: draggableEl,
      getInitialDataForExternal: getInitialDataForExternal,
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
      onDragStart: () => ordered.push('draggable:start'),
      onDrag: () => ordered.push('draggable:drag'),
      onDropTargetChange: () => ordered.push('draggable:change'),
      onDrop: () => ordered.push('draggable:drop'),
    }),
  );

  fireEvent.dragStart(draggableEl, firstInput);

  expect(ordered).toEqual(['draggable:preview']);
  ordered.length = 0;
  expect(getInitialDataForExternal).toHaveBeenCalled();

  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual(['draggable:start']);
  ordered.length = 0;

  // Dragging over A
  fireEvent.dragOver(A);
  // not called until the next frame
  expect(ordered).toEqual([]);
  // @ts-ignore
  requestAnimationFrame.step();
  expect(ordered).toEqual(['draggable:drag']);
  ordered.length = 0;

  // Leaving A
  fireEvent.dragEnter(document.body);
  expect(ordered).toEqual(['draggable:change']);
  ordered.length = 0;

  // cancelling drag
  userEvent.cancel();
  expect(ordered).toEqual(['draggable:drop']);

  // getData only ever called once
  expect(getInitialDataForExternal).toHaveBeenCalledTimes(1);

  cleanup();
});

it('should not request native data from non-dragging draggables', () => {
  const [A, B] = getElements('div');
  const getDataA = jest.fn().mockImplementation(() => ({ name: 'A' }));
  const getDataB = jest.fn().mockImplementation(() => ({ name: 'B' }));

  const cleanup = combine(
    appendToBody(A, B),
    draggable({ element: A, getInitialDataForExternal: getDataA }),
    draggable({ element: B, getInitialDataForExternal: getDataB }),
  );

  userEvent.lift(A);

  expect(getDataA).toHaveBeenCalledTimes(1);
  expect(getDataB).not.toHaveBeenCalled();

  cleanup();
});
