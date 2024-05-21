import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  // ElementDropTargetArgs,
  type ElementDropTargetEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import { type DropTargetRecord, type Input } from '../../../../src/entry-point/types';
import {
  appendToBody,
  getDefaultInput,
  getInitialHistory,
  reset,
  setElementFromPoint,
} from '../../_util';

afterEach(reset);

it('should notify a drop target when a draggable is being lifted inside of it', () => {
  const element = document.createElement('div');
  const dropTarget = document.createElement('div');
  dropTarget.appendChild(element);
  const onGenerateDragPreview = jest.fn();
  const onDragStart = jest.fn();

  const cleanup = combine(
    appendToBody(dropTarget),
    draggable({
      element: element,
      getInitialData: () => ({ hello: 'world' }),
    }),
    dropTargetForElements({
      element: dropTarget,
      onGenerateDragPreview,
      onDragStart,
      getData: () => ({ name: 'Alex' }),
      getDropEffect: () => 'move',
    }),
  );

  fireEvent.dragStart(element);

  const self: DropTargetRecord = {
    element: dropTarget,
    data: { name: 'Alex' },
    dropEffect: 'move',
    isActiveDueToStickiness: false,
  };
  {
    const expected: ElementDropTargetEventPayloadMap['onGenerateDragPreview'] =
      {
        location: getInitialHistory([self]),
        source: {
          data: { hello: 'world' },
          dragHandle: null,
          element: element,
        },
        self,
        nativeSetDragImage: expect.any(Function),
      };
    expect(onGenerateDragPreview).toHaveBeenCalledTimes(1);
    expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);
    expect(onDragStart).not.toHaveBeenCalled();
  }

  // After an animation frame the drag start event should be called
  // @ts-ignore
  requestAnimationFrame.step();
  {
    const expected: ElementDropTargetEventPayloadMap['onDragStart'] = {
      location: getInitialHistory([self]),
      source: {
        data: { hello: 'world' },
        dragHandle: null,
        element: element,
      },
      self,
    };
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith(expected);
  }

  cleanup();
});

it('should notify a drop target with the appropriate data', () => {
  const element = document.createElement('div');
  const dragHandle = document.createElement('div');
  element.appendChild(dragHandle);
  const dropTarget = document.createElement('div');
  dropTarget.appendChild(element);
  const onGenerateDragPreview = jest.fn();
  const draggableData = { hello: 'world' };
  const dropTargetData = { name: 'alex' };

  const cleanup = combine(
    appendToBody(dropTarget),
    setElementFromPoint(dragHandle),
    draggable({
      element: element,
      dragHandle,
      getInitialData: () => draggableData,
    }),
    dropTargetForElements({
      element: dropTarget,
      getData: () => dropTargetData,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(element);

  const self: DropTargetRecord = {
    element: dropTarget,
    data: dropTargetData,
    dropEffect: 'move',
    isActiveDueToStickiness: false,
  };
  const expected: ElementDropTargetEventPayloadMap['onGenerateDragPreview'] = {
    location: getInitialHistory([self]),
    source: {
      data: draggableData,
      dragHandle: dragHandle,
      element: element,
    },
    nativeSetDragImage: expect.any(Function),
    self,
  };
  expect(onGenerateDragPreview).toHaveBeenCalledTimes(1);
  expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should notify a drop target when a draggable and drop target are the same element', () => {
  const element = document.createElement('div');
  const onGenerateDragPreview = jest.fn();

  const cleanup = combine(
    appendToBody(element),
    draggable({
      element: element,
    }),
    dropTargetForElements({
      element: element,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(element);

  const self: DropTargetRecord = {
    element: element,
    data: {},
    dropEffect: 'move',
    isActiveDueToStickiness: false,
  };
  const expected: ElementDropTargetEventPayloadMap['onGenerateDragPreview'] = {
    location: getInitialHistory([self]),
    source: {
      data: {},
      dragHandle: null,
      element: element,
    },
    nativeSetDragImage: expect.any(Function),
    self,
  };
  expect(onGenerateDragPreview).toHaveBeenCalledTimes(1);
  expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should only collect data and dropEffect once from a drop target when lifting', () => {
  const element = document.createElement('div');
  const dropTarget = document.createElement('div');
  dropTarget.appendChild(element);
  const onGenerateDragPreview = jest.fn();
  const onDragStart = jest.fn();
  const getData = jest.fn(() => ({}));
  const getDropEffect = jest.fn(() => 'move' as const);

  const cleanup = combine(
    appendToBody(dropTarget),
    draggable({
      element: element,
    }),
    dropTargetForElements({
      element: dropTarget,
      onGenerateDragPreview,
      onDragStart,
      getData,
      getDropEffect,
    }),
  );

  fireEvent.dragStart(element);

  expect(getData).toHaveBeenCalledTimes(1);
  expect(getDropEffect).toHaveBeenCalledTimes(1);
  getData.mockClear();
  getDropEffect.mockClear();
  expect(onGenerateDragPreview).toHaveBeenCalledTimes(1);

  // After an animation frame the drag start event should be called
  // @ts-ignore
  requestAnimationFrame.step();
  // `getData` and `getDropEffect` should not have been called again
  expect(getData).not.toHaveBeenCalled();
  expect(getDropEffect).not.toHaveBeenCalled();
  expect(onDragStart).toHaveBeenCalledTimes(1);

  cleanup();
});

it('should not notify drop targets that do not contain the draggable on lift', () => {
  const element = document.createElement('div');
  const unrelated = document.createElement('div');
  const onGenerateDragPreview = jest.fn();

  const cleanup = combine(
    appendToBody(element, unrelated),
    draggable({
      element: element,
    }),
    dropTargetForElements({
      element: unrelated,
      onGenerateDragPreview,
    }),
  );

  fireEvent.dragStart(element);

  expect(onGenerateDragPreview).not.toHaveBeenCalled();

  cleanup();
});

it('should notify all drop target parents when a inner draggable is lifted', () => {
  const element = document.createElement('div');
  const parent = document.createElement('div');
  const grandParent = document.createElement('div');
  parent.appendChild(element);
  grandParent.appendChild(parent);
  const parentOnGenerateDragPreview = jest.fn();
  const parentOnDragStart = jest.fn();
  const grandParentOnGenerateDragPreview = jest.fn();
  const grandParentOnDragStart = jest.fn();

  const cleanup = combine(
    appendToBody(grandParent),
    draggable({
      element: element,
      getInitialData: () => ({ name: 'draggable' }),
    }),
    dropTargetForElements({
      element: parent,
      getData: () => ({ name: 'parent' }),
      onGenerateDragPreview: parentOnGenerateDragPreview,
      onDragStart: parentOnDragStart,
    }),
    dropTargetForElements({
      element: grandParent,
      getData: () => ({ name: 'grandParent' }),
      onGenerateDragPreview: grandParentOnGenerateDragPreview,
      onDragStart: grandParentOnDragStart,
    }),
  );

  fireEvent.dragStart(element);

  const parentRecord: DropTargetRecord = {
    element: parent,
    data: { name: 'parent' },
    dropEffect: 'move',
    isActiveDueToStickiness: false,
  };
  const grandParentRecord: DropTargetRecord = {
    element: grandParent,
    data: { name: 'grandParent' },
    dropEffect: 'move',
    isActiveDueToStickiness: false,
  };
  {
    const expected: ElementDropTargetEventPayloadMap['onGenerateDragPreview'] =
      {
        location: getInitialHistory([parentRecord, grandParentRecord]),
        source: {
          data: { name: 'draggable' },
          dragHandle: null,
          element: element,
        },
        nativeSetDragImage: expect.any(Function),
        self: parentRecord,
      };
    expect(parentOnGenerateDragPreview).toHaveBeenCalledWith(expected);
    expect(parentOnGenerateDragPreview).toHaveBeenCalledTimes(1);
  }
  {
    const expected: ElementDropTargetEventPayloadMap['onGenerateDragPreview'] =
      {
        location: getInitialHistory([parentRecord, grandParentRecord]),
        source: {
          data: { name: 'draggable' },
          dragHandle: null,
          element: element,
        },
        nativeSetDragImage: expect.any(Function),
        self: grandParentRecord,
      };
    expect(grandParentOnGenerateDragPreview).toHaveBeenCalledWith(expected);
    expect(grandParentOnGenerateDragPreview).toHaveBeenCalledTimes(1);
  }

  // finish the lift
  // @ts-ignore
  requestAnimationFrame.step();

  {
    const expected: ElementDropTargetEventPayloadMap['onDragStart'] = {
      location: getInitialHistory([parentRecord, grandParentRecord]),
      source: {
        data: { name: 'draggable' },
        dragHandle: null,
        element: element,
      },
      self: parentRecord,
    };
    expect(parentOnDragStart).toHaveBeenCalledWith(expected);
    expect(parentOnDragStart).toHaveBeenCalledTimes(1);
  }
  {
    const expected: ElementDropTargetEventPayloadMap['onDragStart'] = {
      location: getInitialHistory([parentRecord, grandParentRecord]),
      source: {
        data: { name: 'draggable' },
        dragHandle: null,
        element: element,
      },
      self: grandParentRecord,
    };
    expect(grandParentOnDragStart).toHaveBeenCalledWith(expected);
    expect(grandParentOnDragStart).toHaveBeenCalledTimes(1);
  }

  cleanup();
});

it('should provide the getData and getDropEffect functions with information about the drag', () => {
  const element = document.createElement('div');
  const dropTarget = document.createElement('div');
  dropTarget.appendChild(element);
  const getData = jest.fn();
  const getDropEffect = jest.fn(() => 'move' as const);
  const cleanup = combine(
    appendToBody(dropTarget),
    draggable({
      element: element,
    }),
    dropTargetForElements({
      element: dropTarget,
      getData,
      getDropEffect,
    }),
  );
  const input: Input = getDefaultInput({ button: 2 });

  fireEvent.dragStart(element, input);

  type Args = Parameters<typeof dropTargetForElements>[0];
  type GetDataArgs = Parameters<NonNullable<Args['getData']>>[0];

  const expected: GetDataArgs = {
    element: dropTarget,
    input: input,
    source: {
      element: element,
      dragHandle: null,
      data: {},
    },
  };
  expect(getData).toHaveBeenCalledWith(expected);
  expect(getDropEffect).toHaveBeenCalledWith(expected);

  cleanup();
});

it('should not trigger any non-lift events on lift', () => {
  const element = document.createElement('div');
  const onGenerateDragPreview = jest.fn();
  const onDragStart = jest.fn();
  const onDrag = jest.fn();
  const onDropTargetChange = jest.fn();
  const onDrop = jest.fn();
  const onDragEnter = jest.fn();
  const onDragLeave = jest.fn();

  const cleanup = combine(
    appendToBody(element),
    draggable({
      element: element,
    }),
    dropTargetForElements({
      element: element,
      onGenerateDragPreview,
      onDragStart,
      onDrag: onDrag,
      onDropTargetChange: onDropTargetChange,
      onDragEnter,
      onDragLeave,
      onDrop,
    }),
  );

  fireEvent.dragStart(element);

  expect(onGenerateDragPreview).toHaveBeenCalledTimes(1);
  expect(onDragStart).not.toHaveBeenCalled();
  expect(onDrag).not.toHaveBeenCalled();
  expect(onDropTargetChange).not.toHaveBeenCalled();
  expect(onDragEnter).not.toHaveBeenCalled();
  expect(onDragLeave).not.toHaveBeenCalled();
  expect(onDrop).not.toHaveBeenCalled();

  onGenerateDragPreview.mockClear();

  // After an animation frame the drag start event should be called
  // @ts-ignore
  requestAnimationFrame.step();

  expect(onGenerateDragPreview).not.toHaveBeenCalled();
  expect(onDragStart).toHaveBeenCalledTimes(1);
  expect(onDrag).not.toHaveBeenCalled();
  expect(onDropTargetChange).not.toHaveBeenCalled();
  expect(onDragEnter).not.toHaveBeenCalled();
  expect(onDragLeave).not.toHaveBeenCalled();
  expect(onDrop).not.toHaveBeenCalled();

  cleanup();
});
