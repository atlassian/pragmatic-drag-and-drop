// This file was copied from `react-beautiful-dnd` with major adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/reorder-render-sync.spec.js>

import React, { memo, useCallback, useState } from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import type {
  DraggableProvided,
  DroppableProvided,
  DropResult,
} from 'react-beautiful-dnd';

import * as closestEdge from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { DragDropContext, Draggable, Droppable } from '../../../../../src';
import { setElementFromPoint } from '../../../_util';

import { keyboard, mouse, simpleLift } from './_utils/controls';

const extractClosestEdge = jest.spyOn(closestEdge, 'extractClosestEdge');

type Task = {
  id: string;
  onRender: jest.Mock;
};

type TaskItemProps = {
  task: Task;
  provided: DraggableProvided;
};

function TaskItem({ task, provided }: TaskItemProps) {
  task.onRender();
  return (
    <div
      data-testid="drag-handle"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <h4>{task.id}</h4>
    </div>
  );
}

type InnerListProps = {
  tasks: Task[];
};

const InnerList = memo(function InnerList({ tasks }: InnerListProps) {
  return (
    <>
      {tasks.map((task: Task, index: number) => (
        <Draggable draggableId={task.id} index={index} key={task.id}>
          {(draggableProvided: DraggableProvided) => (
            <TaskItem task={task} provided={draggableProvided} />
          )}
        </Draggable>
      ))}
    </>
  );
});

const first: Task = {
  id: 'first',
  onRender: jest.fn(),
};

const second: Task = {
  id: 'second',
  onRender: jest.fn(),
};

const initial: Task[] = [first, second];

function App() {
  const [tasks, setTasks] = useState(initial);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const startIndex = result.source.index;
    const finishIndex = result.destination.index;

    setTasks(tasks => {
      return reorder({
        list: tasks,
        startIndex,
        finishIndex,
      });
    });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided: DroppableProvided) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            <InnerList tasks={tasks} />
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

beforeAll(() => {
  /**
   * Jest does not implement `scrollIntoView` so we have to mock it.
   */
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

const cases = [
  { id: 'mouse', control: mouse },
  { id: 'keyboard', control: keyboard },
] as const;

cases.forEach(({ id, control }) => {
  it(`should call the onBeforeDragStart before connected components are updated, and onDragStart after (${id})`, async () => {
    jest.useFakeTimers();
    const clearRenderMocks = () => {
      first.onRender.mockClear();
      second.onRender.mockClear();
    };

    const { getAllByTestId, unmount } = render(<App />);

    // clearing the initial render before a drag
    expect(first.onRender).toHaveBeenCalledTimes(1);
    expect(second.onRender).toHaveBeenCalledTimes(1);
    clearRenderMocks();

    // start a drag
    const handle: HTMLElement = getAllByTestId('drag-handle')[0];
    setElementFromPoint(handle);
    simpleLift(control, handle);

    // flushing onDragStart
    jest.runOnlyPendingTimers();

    // initial lift will render the first item
    expect(first.onRender).toHaveBeenCalledTimes(1);
    /**
     * ORIGINAL TEST:
     * ```
     * // it will also render the second item as it needs to be pushed down
     * expect(second.onRender).toHaveBeenCalledTimes(1);
     * ```
     *
     * In the migration layer, there is no visual shift, so no rerender is needed.
     */
    expect(second.onRender).toHaveBeenCalledTimes(0);
    clearRenderMocks();

    // Move down
    if (control === keyboard) {
      await act(async () => {
        fireEvent.keyDown(handle, { key: 'ArrowDown' });
        /**
         * The keyboard update will fire synchronously.
         *
         * The keyboard drag preview will update after a microtask.
         */
        await 'microtask';
      });
    } else if (control === mouse) {
      extractClosestEdge.mockReturnValue('bottom');
      act(() => {
        fireEvent.dragOver(getAllByTestId('drag-handle')[1]);
        /**
         * Stepping an animation frame to trigger the update from pdnd core.
         *
         * The mouse drag preview will update synchronously after receiving
         * the update.
         */
        // @ts-expect-error
        requestAnimationFrame.step();
      });
    }

    // item1: moving down
    // item2: moving up
    expect(first.onRender).toHaveBeenCalledTimes(1);
    /**
     * ORIGINAL TEST:
     * ```
     * expect(second.onRender).toHaveBeenCalledTimes(1);
     * ```
     *
     * In the migration layer, there is no visual shift, so no rerender is needed.
     */
    expect(second.onRender).toHaveBeenCalledTimes(0);
    clearRenderMocks();

    // drop (there is no animation because already in the home spot)
    control.drop(handle);

    // only a single render for the reorder and connected component update
    expect(first.onRender).toHaveBeenCalledTimes(1);
    expect(second.onRender).toHaveBeenCalledTimes(1);

    // checking for no post renders
    clearRenderMocks();
    // @ts-expect-error
    requestAnimationFrame.flush();
    jest.runAllTimers();
    expect(first.onRender).toHaveBeenCalledTimes(0);
    expect(second.onRender).toHaveBeenCalledTimes(0);

    unmount();
  });
});
