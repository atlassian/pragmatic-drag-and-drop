// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/draggable/dragging.spec.js>

import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import type { DraggableStateSnapshot } from 'react-beautiful-dnd';

import { zIndex } from '../../../../../../src/draggable/constants';
import { setElementFromPoint } from '../../../../_util';
import App, { RenderItem } from '../_utils/app';
import { mouse, simpleLift } from '../_utils/controls';
import {
  getLast,
  getSnapshotsFor,
  isDragging,
  renderItemAndSpy,
} from '../_utils/helpers';

it('should move to a provided offset', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  setElementFromPoint(handle);
  fireEvent.dragStart(handle, { clientX: 0, clientY: 5 });
  act(() => {
    // @ts-expect-error
    requestAnimationFrame.step();
  });
  expect(isDragging(handle)).toBe(true);

  // no transform as we are at {x: 0, y: 0}
  expect(handle.style.transform).toBe('');
  expect(handle.style.zIndex).toBe(`${zIndex.dragging}`);

  fireEvent.dragOver(handle, { clientX: 0, clientY: 6 });
  act(() => {
    // @ts-expect-error
    requestAnimationFrame.step();
  });

  expect(handle.style.transform).toBe(`translate(0px, 1px)`);
  expect(handle.style.zIndex).toBe(`${zIndex.dragging}`);
});

it('should pass on the snapshot', () => {
  const spy = jest.fn();
  const renderItem: RenderItem = renderItemAndSpy(spy);

  const { getByText } = render(<App renderItem={renderItem} />);
  const handle: HTMLElement = getByText('item: 0');
  expect(getSnapshotsFor('0', spy)).toHaveLength(1);

  const cleanup = setElementFromPoint(handle);

  simpleLift(mouse, handle);
  expect(isDragging(handle)).toBe(true);
  expect(getSnapshotsFor('0', spy)).toHaveLength(2);

  {
    const snapshot = getLast(getSnapshotsFor('0', spy));
    const lift: DraggableStateSnapshot = {
      isDragging: true,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      draggingOver: 'droppable',
      combineWith: null,
      combineTargetFor: null,
      mode: 'FLUID',
    };
    expect(snapshot).toEqual(lift);
  }

  setElementFromPoint(null);
  fireEvent.dragLeave(handle);

  {
    const snapshot = getLast(getSnapshotsFor('0', spy));
    const move: DraggableStateSnapshot = {
      isDragging: true,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      // cleared because we are not setting any dimensions and we are
      // no longer over anything
      draggingOver: null,
      combineWith: null,
      combineTargetFor: null,
      mode: 'FLUID',
    };
    expect(snapshot).toEqual(move);
  }

  cleanup();
});
