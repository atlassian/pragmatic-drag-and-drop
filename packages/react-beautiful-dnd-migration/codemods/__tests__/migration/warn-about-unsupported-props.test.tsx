jest.autoMockOff();

import { createTransformer } from '@atlaskit/codemod-utils';

import {
	unsupportedPropMessages,
	warnAboutUnsupportedProps,
} from '../../migrations/warn-about-unsupported-props';

const transformer = createTransformer([warnAboutUnsupportedProps]);

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;

const transform = { default: transformer, parser: 'tsx' };
const transformOptions = { printOptions: { quote: 'single' } };

describe('warn about removed exports', () => {
	describe('DragDropContext', () => {
		defineInlineTest(
			transform,
			transformOptions,
			`
      import { DragDropContext } from 'react-beautiful-dnd';

      <DragDropContext
        nonce="1234"
      />
      `,
			`
      import { DragDropContext } from 'react-beautiful-dnd';

      <DragDropContext
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.DragDropContext.nonce} */
        nonce="1234"
      />
    `,
			'should warn about the nonce prop',
		);

		defineInlineTest(
			transform,
			transformOptions,
			`
      import { DragDropContext, useMouseSensor } from 'react-beautiful-dnd';

      <DragDropContext
        sensors={[useMouseSensor]}
      />
      `,
			`
      import { DragDropContext, useMouseSensor } from 'react-beautiful-dnd';

      <DragDropContext
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.DragDropContext.sensors} */
        sensors={[useMouseSensor]}
      />
    `,
			'should warn about the sensors prop',
		);

		defineInlineTest(
			transform,
			transformOptions,
			`
      import { DragDropContext } from 'react-beautiful-dnd';

      <DragDropContext
        enableDefaultSensors={false}
      />
      `,
			`
      import { DragDropContext } from 'react-beautiful-dnd';

      <DragDropContext
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.DragDropContext.enableDefaultSensors} */
        enableDefaultSensors={false}
      />
    `,
			'should warn about the enableDefaultSensors prop',
		);
	});

	describe('Draggable', () => {
		defineInlineTest(
			transform,
			transformOptions,
			`
      import { Draggable } from 'react-beautiful-dnd';

      <Draggable
        shouldRespectForcePress={true}
      />
      `,
			`
      import { Draggable } from 'react-beautiful-dnd';

      <Draggable
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.Draggable.shouldRespectForcePress} */
        shouldRespectForcePress={true}
      />
    `,
			'should warn about the shouldRespectForcePress prop',
		);
	});

	describe('Droppable', () => {
		defineInlineTest(
			transform,
			transformOptions,
			`
      import { Droppable } from 'react-beautiful-dnd';

      <Droppable
        isCombineEnabled
      />
      `,
			`
      import { Droppable } from 'react-beautiful-dnd';

      <Droppable
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.Droppable.isCombineEnabled} */
        isCombineEnabled
      />
    `,
			'should warn about the isCombineEnabled prop',
		);

		defineInlineTest(
			transform,
			transformOptions,
			`
      import { Droppable } from 'react-beautiful-dnd';

      <Droppable
        ignoreContainerClipping
      />
      `,
			`
      import { Droppable } from 'react-beautiful-dnd';

      <Droppable
        /* TODO: (from codemod) 

        This prop is not supported by the migration layer. It will not have any effect.

        Reason:
        ${unsupportedPropMessages.Droppable.ignoreContainerClipping} */
        ignoreContainerClipping
      />
    `,
			'should warn about the ignoreContainerClipping prop',
		);
	});
});
