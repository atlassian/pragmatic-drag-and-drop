// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/draggable/portal.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';

import { setElementFromPoint } from '../../../../_util';
import App, { type Item } from '../_utils/app';
import { mouse, simpleLift } from '../_utils/controls';
import { isDragging } from '../_utils/helpers';

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

afterAll(() => {
  document.body.removeChild(portal);
});

const renderItem =
  (item: Item) =>
  (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
    const child = (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        data-testid={item.id}
        data-is-dragging={snapshot.isDragging}
      >
        Drag me!
      </div>
    );

    if (!snapshot.isDragging) {
      return child;
    }

    return ReactDOM.createPortal(child, portal);
  };

it('should allow consumers to use their own portal', () => {
  const { getByTestId } = render(<App renderItem={renderItem} />);
  const before: HTMLElement = getByTestId('0');

  // not in portal yet
  expect(before.parentElement).not.toBe(portal);
  expect(isDragging(before)).toBe(false);

  // moved to portal after lift
  setElementFromPoint(before);
  simpleLift(mouse, before);
  const inPortal: HTMLElement = getByTestId('0');
  expect(inPortal.parentElement).toBe(portal);
  expect(before).not.toBe(inPortal);
  expect(isDragging(inPortal)).toBe(true);

  // out of portal after drop
  mouse.drop(inPortal);
  const after: HTMLElement = getByTestId('0');
  expect(after.parentElement).not.toBe(portal);
  expect(after).not.toBe(inPortal);
  expect(isDragging(after)).toBe(false);
});
