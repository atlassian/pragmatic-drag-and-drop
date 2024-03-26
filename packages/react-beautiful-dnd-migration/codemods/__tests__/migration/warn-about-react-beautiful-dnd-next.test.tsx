jest.autoMockOff();

import { createTransformer } from '@atlaskit/codemod-utils';

import {
  warnAboutReactBeautifulDndNext,
  warningMessageForReactBeautifulDndNext,
} from '../../migrations/warn-about-react-beautiful-dnd-next';

const transformer = createTransformer([warnAboutReactBeautifulDndNext]);

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;

const transform = { default: transformer, parser: 'tsx' };
const transformOptions = { printOptions: { quote: 'single' } };

const expectedComment = `TODO: (from codemod) ${warningMessageForReactBeautifulDndNext}`;

describe('warn about importing from `react-beautiful-dnd-next`', () => {
  defineInlineTest(
    transform,
    transformOptions,
    `
    import { anything } from 'react-beautiful-dnd-next';
    `,
    `
    // ${expectedComment}
    import { anything } from 'react-beautiful-dnd-next';
    `,
    'should add a warning comment',
  );
});
