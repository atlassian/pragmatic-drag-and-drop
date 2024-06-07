import type { Collection, JSCodeshift } from 'jscodeshift';

import { addCommentBefore, getJSXAttributesByName } from '@atlaskit/codemod-utils';

import { forEachRbdElementInFile } from '../utils';

export const unsupportedPropMessages = {
	DragDropContext: {
		nonce: 'A nonce is no longer needed as all styles are now controlled by React.',
		sensors:
			'Custom sensors are not supported. The migration layer supports pointer and keyboard dragging.',
		enableDefaultSensors: 'Disabling default sensors is not supported.',
	},
	Draggable: {
		shouldRespectForcePress: 'The browser is now responsible for handling this concern.',
	},
	Droppable: {
		isCombineEnabled:
			'The migration layer does not support combining items. We did this as the main use case for this behavior was trees - which we now have other packages for.',
		ignoreContainerClipping:
			'The browser is now responsible for determining hit targets. We no longer tweak hitzones for a droppable using this prop.',
	},
};

function getWarningMessage(reason: string) {
	return [
		'\n',
		'This prop is not supported by the migration layer. It will not have any effect.',
		'\nReason:',
		reason,
	].join('\n');
}

/**
 * Adds warning comments above prop usages for props that are not supported by the migration layer.
 */
export function warnAboutUnsupportedProps(j: JSCodeshift, source: Collection<Node>) {
	forEachRbdElementInFile(j, source, ({ originalName, path }) => {
		const messages = unsupportedPropMessages[originalName];

		for (const [attributeName, reason] of Object.entries(messages)) {
			const attributeCollection = getJSXAttributesByName(j, path, attributeName);

			addCommentBefore(j, attributeCollection, getWarningMessage(reason), 'block');
		}
	});
}
