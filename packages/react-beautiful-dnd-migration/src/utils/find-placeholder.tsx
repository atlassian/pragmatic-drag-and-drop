import type { ContextId } from 'react-beautiful-dnd';

import { attributes } from './attributes';
import { findElement } from './find-element';

export function findPlaceholder(contextId: ContextId) {
	return findElement({
		attribute: attributes.placeholder.contextId,
		value: contextId,
	});
}
