// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/unmount.spec.js>

import React from 'react';

import { render } from '@testing-library/react';

import { DragDropContext } from '../../../../../../src';

it('should not throw when unmounting', () => {
  const { unmount } = render(
    <DragDropContext onDragEnd={() => {}}>{null}</DragDropContext>,
  );

  expect(() => unmount()).not.toThrow();
});

it('should clean up any window event handlers', () => {
  const addEventListener = jest.spyOn(window, 'addEventListener');
  const removeEventListener = jest.spyOn(window, 'removeEventListener');

  const { unmount } = render(
    <DragDropContext onDragEnd={() => {}}>{null}</DragDropContext>,
  );

  unmount();

  expect(addEventListener.mock.calls).toHaveLength(
    removeEventListener.mock.calls.length,
  );
  // validation
  expect(addEventListener).toHaveBeenCalled();
  expect(removeEventListener).toHaveBeenCalled();
});
