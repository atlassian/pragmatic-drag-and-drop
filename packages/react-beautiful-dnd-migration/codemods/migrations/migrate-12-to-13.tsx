import type { ASTNode, ASTPath, Collection, JSCodeshift, JSXElement } from 'jscodeshift';

import { addCommentBefore, getJSXAttributesByName } from '@atlaskit/codemod-utils';

import { forEachRbdElementInFile } from '../utils';

export const dragHandlePropMessage = [
	'The migration layer provides the `react-beautiful-dnd` v13 props for the drag handle.',
	'Instead of providing `aria-labelledby` it will instead provide `aria-describedby` and a `role` attribute.',
].join('\n');

const componentMigrations = {
	DragDropContext(j: JSCodeshift, path: ASTPath<JSXElement>) {
		getJSXAttributesByName(j, path, 'liftInstruction').forEach((path) => {
			path.node.name = j.jsxIdentifier('dragHandleUsageInstructions');
		});
	},

	Draggable(j: JSCodeshift, path: ASTPath<JSXElement>) {
		const childrenPath: ASTPath<ASTNode> = path.get('children');

		const expressionPath = j(childrenPath).find(j.JSXExpressionContainer).paths().at(0);
		if (!expressionPath) {
			return;
		}

		const jsxExpression = j.jsxEmptyExpression();
		jsxExpression.comments = [j.commentBlock(` TODO: (from codemod) ${dragHandlePropMessage} `)];

		expressionPath.insertBefore(j.jsxExpressionContainer(jsxExpression));
	},

	Droppable(j: JSCodeshift, path: ASTPath<JSXElement>) {
		const attributeCollection = getJSXAttributesByName(j, path, 'renderClone');
		addCommentBefore(j, attributeCollection, dragHandlePropMessage, 'block');
	},
} as const;

export function migrate12to13(j: JSCodeshift, source: Collection<Node>) {
	forEachRbdElementInFile(j, source, ({ originalName, path }) => {
		componentMigrations[originalName](j, path);
	});
}
