import { type Collection, type default as core } from 'jscodeshift';

import { addCommentBefore } from '@atlaskit/codemod-utils';

import { getImportDeclarationsForRbd } from '../utils';

const removedExports = new Set(['useMouseSensor', 'useTouchSensor', 'useKeyboardSensor']);

export const warningMessageForRemovedExports = [
	'Sensors are not supported in the migration layer.',
	'The migration layer will handle pointer and keyboard dragging for you.',
	'If you specifically want to disable one of these types of dragging, please reach out to us and we will see how we can help you.',
].join('\n');

/**
 * Removes exports that no longer exists,
 * and renders a comment informing users about the removal.
 */
export function warnAboutRemovedExports(j: core.JSCodeshift, source: Collection<Node>) {
	getImportDeclarationsForRbd(j, source)
		.find(j.ImportSpecifier)
		.filter((path) => removedExports.has(path.node.imported.name))
		.forEach((path) => {
			addCommentBefore(j, j(path), warningMessageForRemovedExports, 'block');
		});
}
