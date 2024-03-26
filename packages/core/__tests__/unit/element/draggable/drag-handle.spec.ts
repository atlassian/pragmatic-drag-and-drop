import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  ElementEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import {
  appendToBody,
  getEmptyHistory,
  reset,
  setElementFromPoint,
} from '../../_util';

afterEach(reset);

it('should allow dragging from the drag handle when the drag handle is the same element as the draggable', () => {
  const parent = document.createElement('div');
  const onGenerateDragPreview = jest.fn();
  const cleanup = combine(
    appendToBody(parent),
    setElementFromPoint(parent),
    draggable({
      element: parent,
      dragHandle: parent,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(parent);

  const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
    location: getEmptyHistory(),
    source: {
      data: {},
      dragHandle: parent,
      element: parent,
    },
    nativeSetDragImage: expect.any(Function),
  };
  expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should allow dragging if dragging from a child drag handle element', () => {
  const parent = document.createElement('div');
  const dragHandle = document.createElement('div');
  parent.appendChild(dragHandle);
  const onGenerateDragPreview = jest.fn();
  const cleanup = combine(
    appendToBody(parent),
    setElementFromPoint(dragHandle),
    draggable({
      element: parent,
      dragHandle: dragHandle,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(parent);

  const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
    location: getEmptyHistory(),
    source: {
      data: {},
      dragHandle: dragHandle,
      element: parent,
    },
    nativeSetDragImage: expect.any(Function),
  };
  expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should allow dragging from the child of a drag handle', () => {
  const draggableEl = document.createElement('div');
  const dragHandle = document.createElement('div');
  const dragHandleChild = document.createElement('div');
  dragHandle.appendChild(dragHandleChild);
  draggableEl.appendChild(dragHandle);
  const onGenerateDragPreview = jest.fn();
  const cleanup = combine(
    appendToBody(draggableEl),
    setElementFromPoint(dragHandleChild),
    draggable({
      element: draggableEl,
      dragHandle: dragHandle,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(draggableEl);

  const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
    location: getEmptyHistory(),
    source: {
      data: {},
      dragHandle: dragHandle,
      element: draggableEl,
    },
    nativeSetDragImage: expect.any(Function),
  };
  expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should not allow dragging if not dragging from the drag handle', () => {
  const parent = document.createElement('div');
  const dragHandle = document.createElement('div');
  const dragHandleChild = document.createElement('div');
  dragHandle.appendChild(dragHandleChild);
  parent.appendChild(dragHandle);
  const onGenerateDragPreview = jest.fn();
  const cleanup = combine(
    appendToBody(parent),
    // not using the drag handle
    setElementFromPoint(parent),
    draggable({
      element: parent,
      dragHandle: dragHandle,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(parent);

  expect(onGenerateDragPreview).not.toHaveBeenCalled();

  cleanup();
});
