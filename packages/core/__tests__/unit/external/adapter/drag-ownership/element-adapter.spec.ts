import { fireEvent } from '@testing-library/dom';

import { elementAdapterNativeDataKey } from '../../../../../src/adapter/element-adapter-native-data-key';
import { combine } from '../../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
} from '../../../../../src/entry-point/element/adapter';
import {
  dropTargetForExternal,
  monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import {
  appendToBody,
  getBubbleOrderedTree,
  getElements,
  reset,
  userEvent,
} from '../../../_util';

afterEach(reset);

test('controlled internal drags should not trigger the external adapter', () => {
  const [draggableEl, A] = getBubbleOrderedTree();
  const [link] = getElements('a');
  link.href = '#hello';
  const ordered: string[] = [];

  A.appendChild(link);
  const cleanup = combine(
    appendToBody(A),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
    }),
    dropTargetForExternal({
      element: A,
    }),
    monitorForExternal({
      onDragStart: () => ordered.push('monitor(external):start'),
    }),
  );

  userEvent.lift(draggableEl);

  expect(ordered).toEqual(['draggable:start']);

  cleanup();
});

test('a draggable adding external drag data should not cause the native adapter to start', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    monitorForExternal({
      onDragStart: () => ordered.push('monitor(external):start'),
    }),
    draggable({
      element: A,
      getInitialDataForExternal: () => ({ 'text/plain': 'Hello world' }),
      onDragStart: () => ordered.push('draggable:start'),
      onGenerateDragPreview: () => ordered.push('draggable:preview'),
    }),
    dropTargetForElements({
      element: A,
      onDragStart: () => ordered.push('target(element):start'),
    }),
  );

  const event = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
  });
  A.dispatchEvent(event);

  // native data attached to event
  expect(event.dataTransfer?.types).toEqual([
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

  cleanup();
});

test('dragging a draggable into a new window should not trigger a native drag if the draggable attached no external native data', () => {
  const [A] = getElements('div');
  const ordered: string[] = [];

  const cleanup = combine(
    appendToBody(A),
    monitorForExternal({
      onDragStart: args => ordered.push(`monitor:start-external`),
      onDrop: args => ordered.push(`monitor:drop-external`),
    }),
    dropTargetForExternal({
      element: A,
      onDragEnter: args => ordered.push(`A:enter-external`),
      onDrop: args => ordered.push(`A:drop-external`),
    }),
  );

  // validation: a native drag would trigger an external drag
  {
    const event = new DragEvent('dragenter', {
      bubbles: true,
      cancelable: true,
    });
    event.dataTransfer?.items.add('Hello', 'text/plain');

    window.dispatchEvent(event);
    // @ts-expect-error
    requestAnimationFrame.step();
    expect(ordered).toEqual(['monitor:start-external']);
    ordered.length = 0;

    fireEvent.dragEnter(A);
    expect(ordered).toEqual(['A:enter-external']);
    ordered.length = 0;

    fireEvent.drop(A);
    expect(ordered).toEqual(['A:drop-external', 'monitor:drop-external']);
    ordered.length = 0;
  }

  // actual test: the only native type is our element adapter key
  {
    const event = new DragEvent('dragenter', {
      bubbles: true,
      cancelable: true,
    });
    event.dataTransfer?.items.add('', elementAdapterNativeDataKey);
    window.dispatchEvent(event);
    // @ts-expect-error
    requestAnimationFrame.step();

    expect(ordered).toEqual([]);

    fireEvent.dragEnter(A);
    expect(ordered).toEqual([]);

    fireEvent.drop(A);
    expect(ordered).toEqual([]);
  }

  cleanup();
});
