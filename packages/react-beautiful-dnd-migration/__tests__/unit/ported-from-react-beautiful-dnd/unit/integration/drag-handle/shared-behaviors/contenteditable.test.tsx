import React from 'react';

import { render } from '@testing-library/react';

import {
  DraggableProvided,
  DraggableStateSnapshot,
} from '../../../../../../../src';
import { setup } from '../../../../../_utils/setup';
import App, { Item } from '../../_utils/app';
import {
  Control,
  forEachSensor,
  mouseLiftExtended,
  simpleLift,
} from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
  setup();
});

// using content editable in particular ways causes react logging
jest.spyOn(console, 'error').mockImplementation(() => {});

forEachSensor((control: Control) => {
  it('should block the drag if the drag handle is itself contenteditable', () => {
    const renderItem =
      (item: Item) =>
      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={item.id}
            contentEditable
          />
        );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(false);
  });

  it('should block the drag if originated from a child contenteditable', () => {
    const renderItem =
      (item: Item) =>
      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={`handle-${item.id}`}
          >
            <div data-testid={`inner-${item.id}`} contentEditable />
          </div>
        );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const inner: HTMLElement = getByTestId('inner-0');
    const handle: HTMLElement = getByTestId('handle-0');

    if (control.name === 'mouse') {
      mouseLiftExtended(handle, { elementUnderPointer: inner });
    } else {
      simpleLift(control, inner);
    }

    expect(isDragging(handle)).toBe(false);
  });

  it('should block the drag if originated from a child of a child contenteditable', () => {
    const renderItem =
      (item: Item) =>
      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={`handle-${item.id}`}
          >
            <div contentEditable>
              <p>hello there</p>
              <span data-testid={`inner-${item.id}`}>Edit me!</span>
            </div>
          </div>
        );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const inner: HTMLElement = getByTestId('inner-0');
    const handle: HTMLElement = getByTestId('handle-0');

    if (control.name === 'mouse') {
      mouseLiftExtended(handle, { elementUnderPointer: inner });
    } else {
      simpleLift(control, inner);
    }

    expect(isDragging(handle)).toBe(false);
  });

  it('should not block if contenteditable is set to false', () => {
    const renderItem =
      (item: Item) =>
      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={item.id}
            contentEditable={false}
          />
        );

    const { getByTestId } = render(<App renderItem={renderItem} />);
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(true);
  });

  it('should not block a drag if dragging interactive elements is allowed', () => {
    const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];

    const renderItem =
      (item: Item) =>
      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={item.id}
            contentEditable
          />
        );

    const { getByTestId } = render(
      <App items={items} renderItem={renderItem} />,
    );
    const handle: HTMLElement = getByTestId('0');

    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(true);
  });
});
