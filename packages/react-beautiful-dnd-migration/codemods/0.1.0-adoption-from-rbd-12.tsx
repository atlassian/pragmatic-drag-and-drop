import { createTransformer } from '@atlaskit/codemod-utils';

import { migrations } from './0.1.0-adoption-from-rbd-13';
import { migrate12to13 } from './migrations/migrate-12-to-13';
import { shouldRunCodemodOnFile } from './utils';

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
const transformer = createTransformer([migrate12to13, ...migrations], shouldRunCodemodOnFile);

export default transformer;
