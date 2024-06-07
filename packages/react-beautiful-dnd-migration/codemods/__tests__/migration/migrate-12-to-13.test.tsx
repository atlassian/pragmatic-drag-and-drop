jest.autoMockOff();

import { createTransformer } from '@atlaskit/codemod-utils';

import { dragHandlePropMessage, migrate12to13 } from '../../migrations/migrate-12-to-13';

const transformer = createTransformer([migrate12to13]);

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;

const transform = { default: transformer, parser: 'tsx' };
const transformOptions = { printOptions: { quote: 'single' } };

function getExpectedMessage({ indent }: { indent: number }) {
	const formattedMessage = dragHandlePropMessage.replace(/\n/g, `\n${' '.repeat(indent)}`);
	return `/* TODO: (from codemod) ${formattedMessage} */`;
}

describe('migrate 12 to 13', () => {
	defineInlineTest(
		transform,
		transformOptions,
		`
    import { DragDropContext } from 'react-beautiful-dnd';

    <DragDropContext
      liftInstruction="abcd"
    />
    `,
		`
    import { DragDropContext } from 'react-beautiful-dnd';

    <DragDropContext
      dragHandleUsageInstructions="abcd"
    />
    `,
		'should rename the `liftInstruction` prop',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import { Draggable } from 'react-beautiful-dnd';

    <Draggable>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        />
      )}
    </Draggable>
    `,
		`
    import { Draggable } from 'react-beautiful-dnd';

    <Draggable>
      {${getExpectedMessage({ indent: 6 })}
      }{provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        />
      )}
    </Draggable>
    `,
		'should add a message to each <Draggable> about the drag handle props',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import { Droppable } from 'react-beautiful-dnd';

    <Droppable
      renderClone={someFunction}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        />
      )}
    </Droppable>
    `,
		`
    import { Droppable } from 'react-beautiful-dnd';

    <Droppable
      ${getExpectedMessage({ indent: 6 })}
      renderClone={someFunction}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        />
      )}
    </Droppable>
    `,
		'should add a message to each <Droppable> renderClone attribute about the drag handle props',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import {
      DragDropContext as RbdDragDropContext,
      Draggable as RbdDraggable,
      Droppable as RbdDroppable
    } from 'react-beautiful-dnd';

    <RbdDragDropContext
      liftInstruction="..."
    >
      <RbdDroppable
        renderClone={someFunction}
      >
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <RbdDraggable>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                />
              )}
            </RbdDraggable>
          </div>
        )}
      </RbdDroppable>
    </RbdDragDropContext>
    `,
		`
    import {
      DragDropContext as RbdDragDropContext,
      Draggable as RbdDraggable,
      Droppable as RbdDroppable
    } from 'react-beautiful-dnd';

    <RbdDragDropContext
      dragHandleUsageInstructions="..."
    >
      <RbdDroppable
        ${getExpectedMessage({ indent: 8 })}
        renderClone={someFunction}
      >
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <RbdDraggable>
              {${getExpectedMessage({ indent: 14 })}
              }{provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                />
              )}
            </RbdDraggable>
          </div>
        )}
      </RbdDroppable>
    </RbdDragDropContext>
    `,
		'should work even if imports are aliased',
	);
});
