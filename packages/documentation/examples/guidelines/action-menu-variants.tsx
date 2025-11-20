import React from 'react';

import { Stack } from '@atlaskit/primitives/compiled';

import { EntireEntityIsDraggable } from './entire-entity-is-draggable';
import { EntireEntityIsDraggableWithDragHandleButton } from './entire-entity-is-draggable-with-drag-handle-button';
import { EntireEntityIsDraggableWithGroupedItems } from './entire-entity-is-draggable-with-grouped-items';
import { ImpliedDraggable } from './standalone-card';

export function ActionMenuVariants(): React.JSX.Element {
	return (
		<Stack space="space.100">
			<EntireEntityIsDraggable />
			<EntireEntityIsDraggableWithGroupedItems />
			<EntireEntityIsDraggableWithDragHandleButton />
			<ImpliedDraggable />
		</Stack>
	);
}
