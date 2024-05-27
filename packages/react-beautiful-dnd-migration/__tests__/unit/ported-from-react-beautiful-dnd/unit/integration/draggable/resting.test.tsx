// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/draggable/resting.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type { DraggableRubric } from 'react-beautiful-dnd';

import App, { type Item, type RenderItem } from '../_utils/app';
import {
  atRest,
  getRubricsFor,
  getSnapshotsFor,
  renderItemAndSpy,
} from '../_utils/helpers';

it('should have no movement when at rest', () => {
  const { getByText } = render(<App />);
  const handle: HTMLElement = getByText('item: 0');

  expect(handle.style.transform).toBe('');
  expect(handle.style.transition).toBe('');
  expect(handle.style.zIndex).toBe('');
});

it('should have a resting snapshot', () => {
  const snapshotSpy = jest.fn();
  const renderItem: RenderItem = renderItemAndSpy(snapshotSpy);

  render(<App renderItem={renderItem} />);

  const snapshots = getSnapshotsFor('0', snapshotSpy);
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0]).toEqual(atRest);
});

it('should be provided with its rubric', () => {
  const watcher = jest.fn();
  const items = Array.from(
    { length: 3 },
    (v, k): Item => ({
      id: `${k}`,
    }),
  );
  const renderItem: RenderItem = renderItemAndSpy(watcher);

  render(<App renderItem={renderItem} items={items} />);

  items.forEach((item: Item, index: number) => {
    const expected: DraggableRubric = {
      draggableId: item.id,
      type: 'DEFAULT',
      source: {
        droppableId: 'droppable',
        index,
      },
    };
    const rubrics: DraggableRubric[] = getRubricsFor(item.id, watcher);

    expect(rubrics).toHaveLength(1);
    expect(rubrics[0]).toEqual(expected);
  });
});
