import React from 'react';

import { act, createEvent, fireEvent, render } from '@testing-library/react';

import VirtualBoardExample from '../../../examples/02-react-window';
import { DragDropContext, Draggable, Droppable } from '../../../src';
import { hasDropIndicator } from '../_util';
import { Board } from '../_utils/board';
import App from '../ported-from-react-beautiful-dnd/unit/integration/_utils/app';
import { keyboard } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import {
  isDragging,
  isOver,
} from '../ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

beforeAll(() => {
  /**
   * Jest does not implement `scrollTo` so we have to mock it.
   */
  HTMLElement.prototype.scrollTo = jest.fn();

  /**
   * Jest does not implement `scrollIntoView` so we have to mock it.
   */
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('keyboard dragging', () => {
  test('that keydown handlers are unbound on unmount', () => {
    const addEventListener = jest.spyOn(
      HTMLElement.prototype,
      'addEventListener',
    );
    const removeEventListener = jest.spyOn(
      HTMLElement.prototype,
      'removeEventListener',
    );

    const { getByTestId, unmount } = render(<App />);

    const handle = getByTestId('0');
    keyboard.lift(handle);
    expect(isDragging(handle)).toBe(true);

    unmount();

    expect(addEventListener.mock.calls).toHaveLength(
      removeEventListener.mock.calls.length,
    );
    // validation
    expect(addEventListener).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalled();

    // double check that a key press isn't handled
    const event = createEvent.keyDown(handle, { key: ' ' });
    fireEvent(handle, event);
    expect(event.defaultPrevented).toBe(false);
  });

  test('Pressing Space on a drag handle begins a keyboard drag', () => {
    const { getByTestId, unmount } = render(<App />);

    const handle = getByTestId('0');
    keyboard.lift(handle);

    expect(isDragging(handle)).toBe(true);

    unmount();
  });

  describe('During a keyboard drag (for vertical list)', () => {
    test('pressing ArrowUp decrements the destination index', () => {
      jest.useFakeTimers();

      const onDragStart = jest.fn();
      const onDragEnd = jest.fn();

      const { getByTestId } = render(
        <App onDragStart={onDragStart} onDragEnd={onDragEnd} />,
      );

      const handle = getByTestId('1');
      keyboard.lift(handle);
      expect(isDragging(handle)).toBe(true);

      jest.runOnlyPendingTimers();
      expect(onDragStart).toHaveBeenCalledWith(
        {
          draggableId: '1',
          mode: 'SNAP',
          type: 'DEFAULT',
          source: {
            droppableId: 'droppable',
            index: 1,
          },
        },
        expect.any(Object),
      );

      fireEvent.keyDown(handle, { key: 'ArrowUp' });

      fireEvent.keyDown(handle, { key: ' ' });

      expect(isDragging(handle)).toBe(false);

      expect(onDragEnd).toHaveBeenCalledWith({
        draggableId: '1',
        mode: 'SNAP',
        type: 'DEFAULT',
        combine: null,
        reason: 'DROP',
        source: {
          droppableId: 'droppable',
          index: 1,
        },
        destination: {
          droppableId: 'droppable',
          index: 0,
        },
      });

      jest.useRealTimers();
    });

    it('should move to the next droppable after pressing ArrowRight', () => {
      jest.useFakeTimers();

      const onDragStart = jest.fn();
      const onDragUpdate = jest.fn();

      const { getByTestId } = render(
        <Board onDragStart={onDragStart} onDragUpdate={onDragUpdate} />,
      );

      const handle = getByTestId('A2');
      keyboard.lift(handle);
      expect(isDragging(handle)).toBe(true);
      expect(isOver(handle)).toBe('A');

      jest.runOnlyPendingTimers();
      expect(onDragStart).toHaveBeenCalledWith(
        {
          draggableId: 'A2',
          mode: 'SNAP',
          type: 'DEFAULT',
          source: {
            droppableId: 'A',
            index: 2,
          },
        },
        expect.any(Object),
      );

      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      jest.runOnlyPendingTimers();
      expect(onDragUpdate).toHaveBeenCalledWith(
        {
          draggableId: 'A2',
          mode: 'SNAP',
          type: 'DEFAULT',
          combine: null,
          source: {
            droppableId: 'A',
            index: 2,
          },
          destination: {
            droppableId: 'B',
            index: 0,
          },
        },
        expect.any(Object),
      );
      expect(isOver(handle)).toBe('B');

      fireEvent.keyDown(handle, { key: ' ' });
      expect(isDragging(handle)).toBe(false);

      jest.useRealTimers();
    });
  });

  it('should move to the previous droppable after pressing ArrowLeft', () => {
    jest.useFakeTimers();

    const onDragStart = jest.fn();
    const onDragUpdate = jest.fn();

    const { getByTestId } = render(
      <Board onDragStart={onDragStart} onDragUpdate={onDragUpdate} />,
    );

    const handle = getByTestId('B0');
    keyboard.lift(handle);
    expect(isDragging(handle)).toBe(true);
    expect(isOver(handle)).toBe('B');

    jest.runOnlyPendingTimers();
    expect(onDragStart).toHaveBeenCalledWith(
      {
        draggableId: 'B0',
        mode: 'SNAP',
        type: 'DEFAULT',
        source: {
          droppableId: 'B',
          index: 0,
        },
      },
      expect.any(Object),
    );

    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    jest.runOnlyPendingTimers();
    expect(onDragUpdate).toHaveBeenCalledWith(
      {
        draggableId: 'B0',
        mode: 'SNAP',
        type: 'DEFAULT',
        combine: null,
        source: {
          droppableId: 'B',
          index: 0,
        },
        destination: {
          droppableId: 'A',
          index: 0,
        },
      },
      expect.any(Object),
    );
    expect(isOver(handle)).toBe('A');

    fireEvent.keyDown(handle, { key: ' ' });
    expect(isDragging(handle)).toBe(false);

    jest.useRealTimers();
  });

  it('should have a lower bound for the destination index', () => {
    jest.useFakeTimers();

    const onDragUpdate = jest.fn();

    const { getByTestId } = render(<App onDragUpdate={onDragUpdate} />);

    const handle = getByTestId('1');
    keyboard.lift(handle);
    expect(isDragging(handle)).toBe(true);

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    jest.runOnlyPendingTimers();
    expect(onDragUpdate).toHaveBeenCalledWith(
      {
        draggableId: '1',
        mode: 'SNAP',
        type: 'DEFAULT',
        source: {
          droppableId: 'droppable',
          index: 1,
        },
        combine: null,
        destination: {
          droppableId: 'droppable',
          index: 0,
        },
      },
      expect.any(Object),
    );
    onDragUpdate.mockClear();

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    jest.runOnlyPendingTimers();
    expect(onDragUpdate).not.toHaveBeenCalled();

    fireEvent.keyDown(handle, { key: 'Escape' });

    jest.useRealTimers();
  });

  it('should have an upper bound for the destination index', () => {
    jest.useFakeTimers();

    const onDragStart = jest.fn();
    const onDragUpdate = jest.fn();

    const { getByTestId } = render(
      <App onDragStart={onDragStart} onDragUpdate={onDragUpdate} />,
    );

    const handle = getByTestId('1');
    keyboard.lift(handle);
    expect(isDragging(handle)).toBe(true);

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    jest.runOnlyPendingTimers();
    expect(onDragStart).toHaveBeenCalledWith(
      {
        draggableId: '1',
        mode: 'SNAP',
        type: 'DEFAULT',
        source: {
          droppableId: 'droppable',
          index: 1,
        },
      },
      expect.any(Object),
    );
    expect(onDragUpdate).toHaveBeenCalledWith(
      {
        draggableId: '1',
        mode: 'SNAP',
        type: 'DEFAULT',
        source: {
          droppableId: 'droppable',
          index: 1,
        },
        combine: null,
        destination: {
          droppableId: 'droppable',
          index: 2,
        },
      },
      expect.any(Object),
    );
    onDragUpdate.mockClear();

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    jest.runOnlyPendingTimers();
    expect(onDragUpdate).not.toHaveBeenCalled();

    fireEvent.keyDown(handle, { key: 'Escape' });

    jest.useRealTimers();
  });

  test('drop indicator disappears after drop', () => {
    const { container, getByTestId } = render(<App />);

    const handle = getByTestId('0');

    keyboard.lift(handle);
    expect(isDragging(handle)).toBe(true);

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(hasDropIndicator('droppable', container)).toBe(true);

    keyboard.drop(handle);
    expect(isDragging(handle)).toBe(false);
    expect(hasDropIndicator('droppable', container)).toBe(false);
  });

  describe('virtual lists', () => {
    it('should allow moving down after lifting', () => {
      const { container, getByTestId } = render(<VirtualBoardExample />);

      const handle = getByTestId('item-C3');

      expect(handle).toHaveAttribute('data-rbd-draggable-index', '3');

      keyboard.lift(handle);
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      keyboard.drop(container);

      // It should have moved down
      expect(getByTestId('item-C3')).toHaveAttribute(
        'data-rbd-draggable-index',
        '4',
      );
    });

    it('should rebind the listener after a cancelled drop', () => {
      const { getByTestId } = render(<VirtualBoardExample />);

      /**
       * Lifts the node, and returns the keydown event used.
       */
      function liftNode(): Event {
        const node = getByTestId('item-A0');
        const event = createEvent.keyDown(node, { key: ' ' });
        act(() => {
          fireEvent(node, event);
          // @ts-expect-error
          requestAnimationFrame.step();
        });
        expect(isDragging(getByTestId('item-A0'))).toBe(true);
        return event;
      }

      /**
       * Drops the node, and returns the keydown event used.
       */
      function dropNode(): Event {
        const event = createEvent.keyDown(document, { key: ' ' });
        act(() => {
          fireEvent(document, event);
          // @ts-expect-error
          requestAnimationFrame.step();
        });
        expect(isDragging(getByTestId('item-A0'))).toBe(false);
        return event;
      }

      /**
       * Perform a lift and drop.
       *
       * The events should have their default prevented (to stop scrolling).
       * We can infer that the handler is properly applied by this.
       */
      expect(liftNode().defaultPrevented).toBe(true);
      expect(dropNode().defaultPrevented).toBe(true);

      /**
       * Now do it again.
       *
       * The event handler should have been rebound to the draggable,
       * which would have remounted after the drop.
       *
       * (It unmounted because it had a clone).
       */
      expect(liftNode().defaultPrevented).toBe(true);
      expect(dropNode().defaultPrevented).toBe(true);
    });
  });

  describe('cross-axis dragging', () => {
    function CrossAxisApp() {
      return (
        <DragDropContext onDragEnd={() => {}}>
          <Droppable droppableId="scrollable-parent">
            {provided => (
              <div
                data-testid="scrollable-parent"
                style={{ overflowY: 'scroll' }}
              >
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <Draggable draggableId="A" index={0}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        data-testid="A"
                        data-is-dragging={snapshot.isDragging}
                      />
                    )}
                  </Draggable>
                </div>
              </div>
            )}
          </Droppable>
          <Droppable droppableId="scrollable-droppable">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                data-testid="scrollable-droppable"
                style={{ overflowY: 'scroll' }}
              >
                <Draggable draggableId="B" index={0}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-testid="B"
                      data-is-dragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }

    it('should call scrollTo(0, 0) on the scroll container when it is a parent of the droppable', () => {
      jest.useFakeTimers();

      const { getByTestId } = render(<CrossAxisApp />);

      const handle = getByTestId('B');
      keyboard.lift(handle);
      expect(isDragging(handle)).toBe(true);

      const prevList = getByTestId('scrollable-parent');
      prevList.scrollTo = jest.fn();

      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      jest.runOnlyPendingTimers();

      expect(prevList.scrollTo).toHaveBeenCalledWith(0, 0);

      jest.useRealTimers();
    });

    it('should call scrollTo(0, 0) on the scroll container when it is the droppable', () => {
      jest.useFakeTimers();

      const { getByTestId } = render(<CrossAxisApp />);

      const handle = getByTestId('A');
      keyboard.lift(handle);
      expect(isDragging(handle)).toBe(true);

      const nextList = getByTestId('scrollable-droppable');
      nextList.scrollTo = jest.fn();

      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      jest.runOnlyPendingTimers();

      expect(nextList.scrollTo).toHaveBeenCalledWith(0, 0);

      jest.useRealTimers();
    });

    it('should skip disabled droppables for cross axis movement', () => {
      const App = () => (
        <DragDropContext onDragEnd={() => {}}>
          <Droppable droppableId="A">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable draggableId="A0" index={0}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-testid="A0"
                      data-is-dragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Droppable droppableId="B" isDropDisabled>
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Droppable droppableId="C">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );

      const { container, getByTestId } = render(<App />);

      const handle = getByTestId('A0');
      keyboard.lift(handle);
      expect(isDragging(handle)).toBe(true);
      expect(hasDropIndicator('A', container)).toBe(true);

      fireEvent.keyDown(handle, { key: 'ArrowRight' });

      expect(hasDropIndicator('B', container)).toBe(false);
      expect(hasDropIndicator('C', container)).toBe(true);

      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(hasDropIndicator('B', container)).toBe(false);
      expect(hasDropIndicator('A', container)).toBe(true);

      keyboard.cancel(handle);
    });
  });
});
