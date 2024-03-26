// The tests in this file are derived from the placeholder tests in `react-beautiful-dnd`
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/droppable/placeholder.spec.js>
//
// Drop indicators in the migration layer are rendered through the `placeholder`
// provided by `<Droppable>`, but they behave somewhat differently.

import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import type {
  DroppableId,
  DroppableMode,
  DroppableProvided,
} from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

import { DragDropContext, Draggable, Droppable } from '../../../src';
import { attributes, customAttributes } from '../../../src/utils/attributes';
import { getDroppable, getPlaceholder, setElementFromPoint } from '../_util';
import {
  keyboard,
  mouse,
} from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from '../ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

const columns = [
  { id: 'A', items: [{ id: 'A0' }, { id: 'A1' }, { id: 'A2' }] },
  { id: 'B', items: [{ id: 'B0' }] },
  { id: 'C', items: [] },
];

function Board({
  mode = 'standard',
  columnSpy,
}: {
  mode?: DroppableMode;
  columnSpy?: jest.Mock;
}) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="board" type="column">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {columns.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={`column-${column.id}`}
                index={index}
              >
                {provided => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <div {...provided.dragHandleProps}>Column {column.id}</div>
                    <Droppable droppableId={column.id} type="card" mode={mode}>
                      {(provided, snapshot) => {
                        columnSpy?.(provided, snapshot);
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {column.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    data-is-over={snapshot.draggingOver}
                                    data-is-dragging={snapshot.isDragging}
                                  >
                                    Item {item.id}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function getAllColumnDroppableIds() {
  const droppableIds = columns.map(column => column.id);
  invariant(droppableIds.length > 0, 'There are some droppable ids');
  return droppableIds;
}

function isOver(element: HTMLElement) {
  return element.getAttribute('data-is-over');
}

function findDropIndicator(
  droppableId: DroppableId,
  container: HTMLElement,
): HTMLElement | null {
  return container.querySelector(
    `[${attributes.droppable.id}="${droppableId}"] [${customAttributes.dropIndicator}]`,
  );
}

function hasDropIndicator(
  droppableId: DroppableId,
  container: HTMLElement,
): boolean {
  return Boolean(findDropIndicator(droppableId, container));
}

it('should not render a drop indicator at rest', () => {
  const { container } = render(<Board />);

  const droppableIds = getAllColumnDroppableIds();
  droppableIds.forEach(droppableId => {
    expect(hasDropIndicator(droppableId, container)).toBe(false);
  });
});

it('should render a drop indicator when dragging over', () => {
  const droppableIds = getAllColumnDroppableIds();
  droppableIds.forEach(droppableId => {
    const { container, getByText, unmount } = render(<Board />);

    const handle = getByText('Item A0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    fireEvent.dragEnter(getDroppable(droppableId, container));

    expect(isOver(handle)).toBe(droppableId);
    expect(hasDropIndicator(droppableId, container)).toBe(true);

    unmount();
  });
});

it('should remove all drop indicators if an error occurs while dragging', () => {
  const droppableIds = getAllColumnDroppableIds();
  droppableIds.forEach(droppableId => {
    const { container, getByText, unmount } = render(<Board />);

    const handle = getByText('Item A0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    fireEvent.dragEnter(getDroppable(droppableId, container));

    expect(isDragging(handle)).toBe(true);
    expect(isOver(handle)).toBe(droppableId);
    expect(hasDropIndicator(droppableId, container)).toBe(true);

    fireEvent(window, new Event('error'));

    expect(isDragging(handle)).toBe(false);
    expect(hasDropIndicator(droppableId, container)).toBe(false);

    unmount();
  });
});

/**
 * These tests originated from
 * `packages/pragmatic-drag-and-drop/migration/__tests__/unit/react-beautiful-dnd/unit/integration/droppable/placeholder.test.tsx`
 * but have been inverted.
 *
 * In `react-beautiful-dnd` the placeholder was rendered in the list
 * being dragged __from__.
 *
 * In the migration layer, the placeholder is rendered in the list being
 * dragged __over__.
 */
describe('home list', () => {
  it('should not render a drop indicator while dragging over other lists', () => {
    const { container, getByText } = render(<Board />);

    const handle = getByText('Item A0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    expect(isOver(handle)).toBe('A');
    expect(hasDropIndicator('A', container)).toBe(true);

    const droppableIds = getAllColumnDroppableIds();
    droppableIds
      .filter(droppableId => droppableId !== 'A')
      .forEach(droppableId => {
        fireEvent.dragEnter(getDroppable(droppableId, container));

        // regardless of what we are over
        // there should not be a drop indicator in home
        expect(isOver(handle)).toBe(droppableId);
        expect(hasDropIndicator('A', container)).toBe(false);
      });
  });

  it('should immediately remove the home drop indicator after dropping into any list', () => {
    const droppableIds = getAllColumnDroppableIds();
    droppableIds.forEach(droppableId => {
      const { container, getByText, unmount } = render(<Board />);

      const handle = getByText('Item A0');
      setElementFromPoint(handle);
      mouse.lift(handle);

      fireEvent.dragEnter(getDroppable(droppableId, container));
      expect(isOver(handle)).toBe(droppableId);
      expect(hasDropIndicator(droppableId, container)).toBe(true);

      mouse.drop(handle);
      expect(hasDropIndicator(droppableId, container)).toBe(false);

      unmount();
    });
  });

  /**
   * The original `react-beautiful-dnd` test checked the placeholder was removed
   * immediately after dropping nowhere.
   *
   * This has been changed in the migration layer to check that no drop indicator
   * exists if dragging over nowhere.
   */
  it('should not have any drop indicator if dragging nowhere', () => {
    const droppableIds = getAllColumnDroppableIds();
    droppableIds.forEach(droppableId => {
      const { container, getByText, unmount } = render(<Board />);

      const handle = getByText('Item A0');
      setElementFromPoint(handle);
      mouse.lift(handle);

      expect(
        container.querySelector(`[${customAttributes.dropIndicator}]`),
      ).not.toBe(null);

      fireEvent.dragEnter(getDroppable(droppableId, container));
      fireEvent.dragLeave(getDroppable(droppableId, container));
      expect(isOver(handle)).toBe(null);

      expect(
        container.querySelector(`[${customAttributes.dropIndicator}]`),
      ).toBe(null);

      mouse.drop(handle);
      expect(hasDropIndicator(droppableId, container)).toBe(false);

      unmount();
    });
  });
});

describe('foreign list', () => {
  it('should render a drop indicator if dragging over', () => {
    const droppableIds = getAllColumnDroppableIds();
    droppableIds
      .filter(droppableId => droppableId !== 'A')
      .forEach(droppableId => {
        const { container, getByText, unmount } = render(<Board />);

        const handle = getByText('Item A0');
        setElementFromPoint(handle);
        mouse.lift(handle);

        fireEvent.dragEnter(getDroppable(droppableId, container));
        expect(isOver(handle)).toBe(droppableId);
        expect(hasDropIndicator(droppableId, container)).toBe(true);

        unmount();
      });
  });

  it('should not render a drop indicator if not dragging over', () => {
    const droppableIds = getAllColumnDroppableIds();
    droppableIds
      .filter(droppableId => droppableId !== 'A')
      .forEach(droppableId => {
        const { container, getByText, unmount } = render(<Board />);

        const handle = getByText('Item A0');
        setElementFromPoint(handle);
        mouse.lift(handle);

        expect(isOver(handle)).toBe('A');
        expect(hasDropIndicator(droppableId, container)).toBe(false);

        unmount();
      });
  });
});

/**
 * The tests below here are not derived from `react-beautiful-dnd`.
 *
 * These tests are new.
 */

describe('auto scroll', () => {
  describe('keyboard drag', () => {
    it('should call scrollIntoView after moving', () => {
      const { container, getByText } = render(<Board />);

      const handle = getByText('Item A0');
      keyboard.lift(handle);

      const dropIndicator = container.querySelector(
        `[${customAttributes.dropIndicator}]`,
      );
      invariant(dropIndicator, 'There is a drop indicator being rendered.');

      dropIndicator.scrollIntoView = jest.fn();

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      expect(dropIndicator.scrollIntoView).toHaveBeenCalled();

      keyboard.cancel(handle);
    });
  });

  describe('mouse drag', () => {
    it('should NOT call scrollIntoView after moving', () => {
      const { container, getByText } = render(<Board />);

      const handle = getByText('Item A0');
      setElementFromPoint(handle);
      mouse.lift(handle);

      const dropIndicator = container.querySelector(
        `[${customAttributes.dropIndicator}]`,
      );
      invariant(dropIndicator, 'There is a drop indicator being rendered.');
      dropIndicator.scrollIntoView = jest.fn();

      const initialTarget = getByText('Item A1');
      extractClosestEdge.mockReturnValue('top');
      fireEvent.dragEnter(initialTarget);
      fireEvent.dragOver(initialTarget);
      expect(dropIndicator.scrollIntoView).not.toHaveBeenCalled();

      mouse.cancel(handle);
    });
  });
});

describe('provided placeholder element', () => {
  it('should NOT be null for standard lists', () => {
    const columnSpy = jest.fn((_: DroppableProvided) => {});

    const { container, getByText } = render(
      <Board mode="standard" columnSpy={columnSpy} />,
    );

    // Ignore the initial render
    columnSpy.mockClear();

    const handle = getByText('Item A0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    expect(hasDropIndicator('A', container)).toBe(true);

    const callsForColumnA = columnSpy.mock.calls.filter(
      ([provided]) => provided.droppableProps['data-rbd-droppable-id'] === 'A',
    );

    expect(callsForColumnA).toHaveLength(1);
    expect(callsForColumnA[0][0]).not.toHaveProperty('placeholder', null);

    mouse.cancel(handle);
  });

  it('should be null for virtual lists', () => {
    const columnSpy = jest.fn((_: DroppableProvided) => {});

    const { container, getByText } = render(
      <Board mode="virtual" columnSpy={columnSpy} />,
    );

    // Ignore the initial render
    columnSpy.mockClear();

    const handle = getByText('Item A0');
    setElementFromPoint(handle);
    mouse.lift(handle);

    expect(hasDropIndicator('A', container)).toBe(true);

    const callsForColumnA = columnSpy.mock.calls.filter(
      ([provided]) => provided.droppableProps['data-rbd-droppable-id'] === 'A',
    );

    expect(callsForColumnA).toHaveLength(1);
    expect(callsForColumnA[0][0]).toHaveProperty('placeholder', null);

    mouse.cancel(handle);
  });
});

describe('hiding the drop indicator', () => {
  it('should be hidden when the source and target destinations are the same', () => {
    const { container, getByText } = render(<Board />);

    const handle = getByText('Item A1');
    setElementFromPoint(handle);
    mouse.lift(handle);

    const dropIndicator = container.querySelector(
      `[${customAttributes.dropIndicator}]`,
    );
    invariant(dropIndicator, 'There is a drop indicator being rendered.');
    dropIndicator.scrollIntoView = jest.fn();

    /**
     * The drop indicator should be hidden when over:
     */

    /**
     * The bottom edge of the item before
     */
    extractClosestEdge.mockReturnValue('bottom');
    fireEvent.dragEnter(getByText('Item A0'));
    expect(dropIndicator).not.toBeVisible();

    /**
     * The top edge of the item itself
     */
    extractClosestEdge.mockReturnValue('top');
    fireEvent.dragEnter(getPlaceholder());
    expect(dropIndicator).not.toBeVisible();

    /**
     * The top edge of the item after
     */
    extractClosestEdge.mockReturnValue('top');
    fireEvent.dragEnter(getByText('Item A2'));
    expect(dropIndicator).not.toBeVisible();

    /**
     * The bottom edge of the item itself
     */
    extractClosestEdge.mockReturnValue('bottom');
    fireEvent.dragEnter(getPlaceholder());
    expect(dropIndicator).not.toBeVisible();

    mouse.cancel(handle);
  });

  it('should still scroll to hidden indicators during a keyboard drag', () => {
    const { container, getByText } = render(<Board />);

    const handle = getByText('Item A1');
    keyboard.lift(handle);

    const dropIndicator = container.querySelector(
      `[${customAttributes.dropIndicator}]`,
    );
    invariant(dropIndicator, 'There is a drop indicator being rendered.');
    const scrollIntoView = jest.fn();
    dropIndicator.scrollIntoView = scrollIntoView;

    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(dropIndicator).toBeVisible();
    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockClear();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(dropIndicator).not.toBeVisible();
    expect(scrollIntoView).toHaveBeenCalled();

    keyboard.cancel(handle);
  });
});
