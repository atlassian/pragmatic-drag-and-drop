import React from 'react';

import { Stack } from '@atlaskit/primitives/compiled';

import { EntireEntityIsDraggable } from './entire-entity-is-draggable';
import { EntireEntityIsDraggableWithDragHandleButton } from './entire-entity-is-draggable-with-drag-handle-button';
import { EntireEntityIsDraggableWithGroupedItems } from './entire-entity-is-draggable-with-grouped-items';
import { StandaloneCard } from './standalone-card';

export function ActionMenuVariants() {
	return (
		<Stack space="space.100">
			<EntireEntityIsDraggable />
			<EntireEntityIsDraggableWithGroupedItems />
			<EntireEntityIsDraggableWithDragHandleButton />
			<StandaloneCard />
		</Stack>
	);
}
