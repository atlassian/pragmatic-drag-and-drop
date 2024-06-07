import { createTransformer } from '@atlaskit/codemod-utils';

import { updateImports } from './migrations/update-imports';
import { warnAboutReactBeautifulDndNext } from './migrations/warn-about-react-beautiful-dnd-next';
import { warnAboutRemovedExports } from './migrations/warn-about-removed-exports';
import { warnAboutUnsupportedProps } from './migrations/warn-about-unsupported-props';
import { shouldRunCodemodOnFile } from './utils';

export const migrations = [
	warnAboutRemovedExports,
	warnAboutUnsupportedProps,
	warnAboutReactBeautifulDndNext,
	updateImports,
];

/**
 * Codemod for converting `react-beautiful-dnd` usage to the migration layer package.
 *
 * This codemod will:
 * - Change imports from `react-beautiful-dnd` to the migration layer package.
 * - Add warnings when unsupported API is used.
 *
 * The order here is significant.
 *
 * The `updateImports` transform should occur last,
 * as the previous transforms only operate on imports from `react-beautiful-dnd`.
 */
const transformer = createTransformer(migrations, shouldRunCodemodOnFile);

export default transformer;
