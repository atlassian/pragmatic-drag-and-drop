jest.autoMockOff();

import { createTransformer } from '@atlaskit/codemod-utils';

import {
	warnAboutRemovedExports,
	warningMessageForRemovedExports,
} from '../../migrations/warn-about-removed-exports';

const transformer = createTransformer([warnAboutRemovedExports]);

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;

const transform = { default: transformer, parser: 'tsx' };
const transformOptions = { printOptions: { quote: 'single' } };

function getExpectedComment({ indent }: { indent: number }) {
	/**
	 * The raw warning message has no indent formatting.
	 *
	 * The expected message will be indented based on its context.
	 */
	const formattedMessage = warningMessageForRemovedExports.replace(
		/\n/g,
		`\n${' '.repeat(indent)}`,
	);
	return `TODO: (from codemod) ${formattedMessage}`;
}

describe('warn about removed exports', () => {
	defineInlineTest(
		transform,
		transformOptions,
		`
    import {
      useMouseSensor,
      DragDropContext
    } from 'react-beautiful-dnd';
    `,
		`
    import {
      /* ${getExpectedComment({ indent: 6 })} */
      useMouseSensor,
      DragDropContext
    } from 'react-beautiful-dnd';
    `,
		'should remove a single sensor import and add a comment',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import {
      useMouseSensor,
      useTouchSensor,
      useKeyboardSensor,
      DragDropContext
    } from 'react-beautiful-dnd';
    `,
		`
    import {
      /* ${getExpectedComment({ indent: 6 })} */
      useMouseSensor,
      /* ${getExpectedComment({ indent: 6 })} */
      useTouchSensor,
      /* ${getExpectedComment({ indent: 6 })} */
      useKeyboardSensor,
      DragDropContext
    } from 'react-beautiful-dnd';
    `,
		'should remove multiple sensor imports and add a comment',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import {
      useMouseSensor as Draggable
    } from 'react-beautiful-dnd';

    import somethingElse from 'another-package';
    `,
		`
    import {
      /* ${getExpectedComment({ indent: 6 })} */
      useMouseSensor as Draggable
    } from 'react-beautiful-dnd';

    import somethingElse from 'another-package';
    `,
		'should work if the sensor import is aliased',
	);

	defineInlineTest(
		transform,
		transformOptions,
		`
    import { useMouseSensor } from 'react-beautiful-dnd';

    import somethingElse from 'another-package';
    `,
		`
    import { /* ${getExpectedComment({ indent: 4 })} */
    useMouseSensor } from 'react-beautiful-dnd';

    import somethingElse from 'another-package';
    `,
		'should work for single line imports',
	);
});
