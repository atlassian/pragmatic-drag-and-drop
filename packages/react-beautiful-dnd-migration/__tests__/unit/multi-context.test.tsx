import React, { useEffect } from 'react';

import { fireEvent, render } from '@testing-library/react';
import type { DragStart, DragUpdate, Responders } from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../src';
import { useMonitorForLifecycle } from '../../src/drag-drop-context/lifecycle-context';

import { setElementFromPoint } from './_util';
import {
  keyboard,
  mouse,
} from './ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

type ItemData = { id: string }[];

const defaultItemData = [
  [{ id: '0' }, { id: '1' }, { id: '2' }],
  [{ id: '0' }, { id: '1' }, { id: '2' }],
];

function noop() {}

function VerticalList({
  contextId,
  responders,
  itemData,
}: {
  contextId: number;
  responders: Partial<Responders>;
  itemData: ItemData;
}) {
  return (
    <DragDropContext onDragEnd={noop} {...responders}>
      <Droppable droppableId="droppable">
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid={`${contextId}-droppable`}
          >
            {itemData.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    data-testid={`${contextId}-${item.id}`}
                  >
                    {item.id}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function App({
  responders = [],
  itemData = defaultItemData,
}: {
  responders?: Partial<Responders>[];
  itemData?: ItemData[];
}) {
  return (
    <>
      {Array.from({ length: 2 }, (_, index) => (
        <VerticalList
          key={index}
          contextId={index}
          responders={responders[index]}
          itemData={itemData[index]}
        />
      ))}
    </>
  );
}

function getResponders() {
  return {
    onDragStart: jest.fn(),
    onDragUpdate: jest.fn(),
    onDragEnd: jest.fn(),
  };
}

beforeAll(() => {
  jest.useFakeTimers();

  /**
   * Does not exist in jest so needs to be mocked
   */
  HTMLElement.prototype.scrollTo = jest.fn();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('when there are multiple <DragDropContext> instances', () => {
  it('should ignore interactions with other context elements', () => {
    const responders = [getResponders(), getResponders()];

    const { getByTestId } = render(<App responders={responders} />);

    // Lifting an element in the second context instance
    const handle = getByTestId('1-0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    // flush responders
    jest.runOnlyPendingTimers();

    const start: DragStart = {
      mode: 'FLUID',
      type: 'DEFAULT',
      draggableId: '0',
      source: {
        droppableId: 'droppable',
        index: 0,
      },
    };

    expect(responders[0].onDragStart).not.toHaveBeenCalled();
    expect(responders[1].onDragStart).toHaveBeenCalledWith(
      start,
      expect.any(Object),
    );

    // Leave the droppable we started in
    fireEvent.dragLeave(getByTestId('1-droppable'));

    // flush responders
    jest.runOnlyPendingTimers();

    // we are no longer dragging over anything owned by the source context,
    // so the destination should be null
    const update: DragUpdate = {
      ...start,
      combine: null,
      destination: null,
    };

    expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
    expect(responders[1].onDragUpdate).toHaveBeenCalledWith(
      update,
      expect.any(Object),
    );

    responders[1].onDragUpdate.mockClear();

    // enter the droppable owned by the other context
    fireEvent.dragEnter(getByTestId('0-droppable'));
    // enter a draggable owned by the other context
    fireEvent.dragEnter(getByTestId('0-1'));

    // flush responders
    jest.runOnlyPendingTimers();

    // entering the other context should not trigger updates
    expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
    expect(responders[1].onDragUpdate).not.toHaveBeenCalled();
  });

  describe('keyboard controls', () => {
    it('should only consider current context to determine main-axis dragging', () => {
      const responders = [getResponders(), getResponders()];

      /**
       * The second list has less items, but otherwise all of the
       * draggable and droppable ids will be the same.
       */
      const itemData = [
        [{ id: '0' }, { id: '1' }, { id: '2' }],
        [{ id: '0' }, { id: '1' }],
      ];

      const { getByTestId } = render(
        <App responders={responders} itemData={itemData} />,
      );

      const handle = getByTestId('1-0');
      keyboard.lift(handle);

      // flush responders
      jest.runOnlyPendingTimers();

      const start: DragStart = {
        mode: 'SNAP',
        type: 'DEFAULT',
        draggableId: '0',
        source: {
          droppableId: 'droppable',
          index: 0,
        },
      };

      expect(responders[0].onDragStart).not.toHaveBeenCalled();
      expect(responders[1].onDragStart).toHaveBeenCalledWith(
        start,
        expect.any(Object),
      );

      // can move down once
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      jest.runOnlyPendingTimers();
      expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
      expect(responders[1].onDragUpdate).toHaveBeenCalled();

      responders[1].onDragUpdate.mockClear();

      // cannot move down again
      fireEvent.keyDown(handle, { key: 'ArrowDown' });

      // flush responders
      jest.runOnlyPendingTimers();

      expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
      expect(responders[1].onDragUpdate).not.toHaveBeenCalled();

      keyboard.cancel(handle);
    });

    it('should only consider current context to determine cross-axis dragging', () => {
      const responders = [getResponders(), getResponders()];

      const { getByTestId } = render(<App responders={responders} />);

      const handle = getByTestId('0-0');
      keyboard.lift(handle);

      // flush responders
      jest.runOnlyPendingTimers();

      const start: DragStart = {
        mode: 'SNAP',
        type: 'DEFAULT',
        draggableId: '0',
        source: {
          droppableId: 'droppable',
          index: 0,
        },
      };

      expect(responders[0].onDragStart).toHaveBeenCalledWith(
        start,
        expect.any(Object),
      );
      expect(responders[1].onDragStart).not.toHaveBeenCalled();

      // cannot move cross-axis at all
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      jest.runOnlyPendingTimers();
      expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
      expect(responders[1].onDragUpdate).not.toHaveBeenCalled();

      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      jest.runOnlyPendingTimers();
      expect(responders[0].onDragUpdate).not.toHaveBeenCalled();
      expect(responders[1].onDragUpdate).not.toHaveBeenCalled();

      keyboard.cancel(handle);
    });
  });

  it('their lifecycle events should be separate', () => {
    const LifecycleMonitor = ({ spy }: { spy: jest.Mock }) => {
      const monitorForLifecycle = useMonitorForLifecycle();

      useEffect(() => {
        return monitorForLifecycle({
          onPendingDragStart(args) {
            spy(args);
          },
        });
      }, [monitorForLifecycle, spy]);

      return null;
    };

    const spyA = jest.fn();
    const spyB = jest.fn();

    const { getByText } = render(
      <>
        <DragDropContext onDragEnd={noop}>
          <Droppable droppableId="A">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable draggableId="A0" index={0}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      A0
                      <LifecycleMonitor spy={spyA} />
                    </div>
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <DragDropContext onDragEnd={noop}>
          <Droppable droppableId="B">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable draggableId="B0" index={0}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      B0
                      <LifecycleMonitor spy={spyB} />
                    </div>
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>,
    );

    const handle = getByText('A0');
    keyboard.lift(handle);

    expect(spyA).toHaveBeenCalled();
    expect(spyB).not.toHaveBeenCalled();
  });
});
