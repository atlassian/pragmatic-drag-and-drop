import type { Collection, JSCodeshift } from 'jscodeshift';

import { addCommentBefore } from '@atlaskit/codemod-utils';

export const warningMessageForReactBeautifulDndNext =
	'`react-beautiful-dnd-next` is not supported by the migration layer.';

export function warnAboutReactBeautifulDndNext(j: JSCodeshift, source: Collection<Node>) {
	const importDeclarationCollection = source
		.find(j.ImportDeclaration)
		.filter((path) => path.node.source.value === 'react-beautiful-dnd-next');

	addCommentBefore(j, importDeclarationCollection, warningMessageForReactBeautifulDndNext, 'line');
}
