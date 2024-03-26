import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
  draggable,
  dropTargetForElements,
  ElementDropTargetGetFeedbackArgs,
} from '../../../../src/entry-point/element/adapter';
import type { DropTargetAllowedDropEffect } from '../../../../src/entry-point/types';
import {
  appendToBody,
  getBubbleOrderedTree,
  getDefaultInput,
  reset,
  userEvent,
} from '../../_util';

afterEach(reset);

it('should recollect data and dropEffect during a drag', () => {
  const [draggableEl, A] = getBubbleOrderedTree();

  const ordered: string[] = [];

  const canDrop = jest.fn(
    (() => {
      let count = 0;
      return () => {
        ordered.push(`canDrop():${count++}`);
        return true;
      };
    })(),
  );

  const getData = jest.fn(
    (() => {
      let count = 0;
      return () => {
        const result = count++;
        ordered.push(`getData():${result}`);
        return {
          count: result,
        };
      };
    })(),
  );

  const getDropEffect = jest.fn(
    (() => {
      let count = 0;
      return (): DropTargetAllowedDropEffect => {
        ordered.push(`getDropEffect():${count++}`);
        return 'move';
      };
    })(),
  );

  const getIsSticky = jest.fn(
    (() => {
      let count = 0;
      return () => {
        ordered.push(`getIsSticky():${count++}`);
        return true;
      };
    })(),
  );

  const cleanup = combine(
    appendToBody(A),
    dropTargetForElements({
      element: A,
      canDrop,
      getData,
      getDropEffect,
      getIsSticky,
      onDragStart: () => ordered.push('a:start'),
      onDrag: () => ordered.push('a:drag'),
    }),
    draggable({
      element: draggableEl,
      onDragStart: () => ordered.push('draggable:start'),
      onDrag: () => ordered.push('draggable:drag'),
    }),
  );

  userEvent.lift(draggableEl, getDefaultInput({ pageX: 10 }));

  expect(ordered).toEqual([
    'canDrop():0',
    'getData():0',
    'getDropEffect():0',
    'draggable:start',
    'a:start',
  ]);
  ordered.length = 0;
  {
    const expected: ElementDropTargetGetFeedbackArgs = {
      element: A,
      input: getDefaultInput({ pageX: 10 }),
      source: {
        element: draggableEl,
        dragHandle: null,
        data: {},
      },
    };
    expect(canDrop).toHaveBeenCalledWith(expected);
    expect(getData).toHaveBeenCalledWith(expected);
    expect(getDropEffect).toHaveBeenCalledWith(expected);
    // getIsSticky() is only called if trying to figure out whether to
    // make a drop target sticky
    expect(getIsSticky).not.toHaveBeenCalled();
    canDrop.mockClear();
    getData.mockClear();
    getDropEffect.mockClear();
    getIsSticky.mockClear();
  }

  fireEvent.dragOver(A, getDefaultInput({ pageX: 25 }));
  // @ts-ignore
  requestAnimationFrame.step();

  expect(ordered).toEqual([
    'canDrop():1',
    'getData():1',
    'getDropEffect():1',
    'draggable:drag',
    'a:drag',
  ]);
  {
    const expected: ElementDropTargetGetFeedbackArgs = {
      element: A,
      input: getDefaultInput({ pageX: 25 }),
      source: {
        element: draggableEl,
        dragHandle: null,
        data: {},
      },
    };
    expect(canDrop).toHaveBeenCalledWith(expected);
    expect(getData).toHaveBeenCalledWith(expected);
    expect(getDropEffect).toHaveBeenCalledWith(expected);
    // getIsSticky() is only called if trying to figure out whether to
    // make a drop target sticky
    expect(getIsSticky).not.toHaveBeenCalled();
  }

  cleanup();
});
