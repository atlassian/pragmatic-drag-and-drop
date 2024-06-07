import { type Collection, type default as core } from 'jscodeshift';

import { getImportDeclarationsForRbd, migrationPackageName } from '../utils';

/**
 * Changes imports from `react-beautiful-dnd` to instead import from the migration layer package.
 *
 * There are no smarts to this change, it just changes the package being imported from.
 */
export function updateImports(j: core.JSCodeshift, source: Collection<Node>) {
	getImportDeclarationsForRbd(j, source).forEach((path) => {
		path.node.source.value = migrationPackageName;
	});
}
