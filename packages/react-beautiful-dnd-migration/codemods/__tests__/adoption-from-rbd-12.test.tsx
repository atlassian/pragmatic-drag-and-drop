jest.autoMockOff();

import transformer from '../0.1.0-adoption-from-rbd-12';
import { unsupportedPropMessages } from '../migrations/warn-about-unsupported-props';
import { migrationPackageName } from '../utils';

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;

const transform = { default: transformer, parser: 'tsx' };
const transformOptions = { printOptions: { quote: 'single' } };

/**
 * This is essentially an integration test for all of the individual units.
 */
describe('adoption transformer', () => {
	defineInlineTest(
		transform,
		transformOptions,
		`
    import React from 'react';

    import {
      DragDropContext,
      Draggable,
      Droppable,
      useMouseSensor,
      useKeyboardSensor,
    } from 'react-beautiful-dnd';
    import type { DroppableProps } from 'react-beautiful-dnd';

    import type { DraggableProps } from 'react-beautiful-dnd-next';

    import { useCustomSensor } from './use-custom-sensor';

    function App() {
      return (
        <DragDropContext
          onDragEnd={() => {}}
          enableDefaultSensors={false}
          sensors={[useMouseSensor, useKeyboardSensor, useCustomSensor]}
          liftInstruction="..."
        >
          <Droppable
            droppableId="droppableId"
            isCombineEnabled
            renderClone={renderClone}
          >
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable
                  draggableId="draggableId"
                  index={0}
                  shouldRespectForcePress
                >
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      Draggable
                    </div>
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }
    `,
		`
    import React from 'react';

    import {
      DragDropContext,
      Draggable,
      Droppable,
      /* TODO: (from codemod) Sensors are not supported in the migration layer.
      The migration layer will handle pointer and keyboard dragging for you.
      If you specifically want to disable one of these types of dragging, please reach out to us and we will see how we can help you. */
      useMouseSensor,
      /* TODO: (from codemod) Sensors are not supported in the migration layer.
      The migration layer will handle pointer and keyboard dragging for you.
      If you specifically want to disable one of these types of dragging, please reach out to us and we will see how we can help you. */
      useKeyboardSensor,
    } from '${migrationPackageName}';
    import type { DroppableProps } from '${migrationPackageName}';

    // TODO: (from codemod) \`react-beautiful-dnd-next\` is not supported by the migration layer.
    import type { DraggableProps } from 'react-beautiful-dnd-next';

    import { useCustomSensor } from './use-custom-sensor';

    function App() {
      return (
        <DragDropContext
          onDragEnd={() => {}}
          /* TODO: (from codemod)\u0020

          This prop is not supported by the migration layer. It will not have any effect.

          Reason:
          ${unsupportedPropMessages.DragDropContext.enableDefaultSensors} */
          enableDefaultSensors={false}
          /* TODO: (from codemod)\u0020

          This prop is not supported by the migration layer. It will not have any effect.

          Reason:
          ${unsupportedPropMessages.DragDropContext.sensors} */
          sensors={[useMouseSensor, useKeyboardSensor, useCustomSensor]}
          dragHandleUsageInstructions="..."
        >
          <Droppable
            droppableId="droppableId"
            /* TODO: (from codemod)\u0020

            This prop is not supported by the migration layer. It will not have any effect.

            Reason:
            ${unsupportedPropMessages.Droppable.isCombineEnabled} */
            isCombineEnabled
            /* TODO: (from codemod) The migration layer provides the \`react-beautiful-dnd\` v13 props for the drag handle.
            Instead of providing \`aria-labelledby\` it will instead provide \`aria-describedby\` and a \`role\` attribute. */
            renderClone={renderClone}
          >
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable
                  draggableId="draggableId"
                  index={0}
                  /* TODO: (from codemod)\u0020

                  This prop is not supported by the migration layer. It will not have any effect.

                  Reason:
                  ${unsupportedPropMessages.Draggable.shouldRespectForcePress} */
                  shouldRespectForcePress
                >
                  {/* TODO: (from codemod) The migration layer provides the \`react-beautiful-dnd\` v13 props for the drag handle.
                  Instead of providing \`aria-labelledby\` it will instead provide \`aria-describedby\` and a \`role\` attribute. */
                  }{provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      Draggable
                    </div>
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }
    `,
		'should correctly handle basic usage',
	);
});
