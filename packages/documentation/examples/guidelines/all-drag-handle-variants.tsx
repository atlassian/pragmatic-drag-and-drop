import React from 'react';

import { Stack } from '@atlaskit/primitives/compiled';

import { EntireEntityIsDraggable } from './entire-entity-is-draggable';
import { EntireEntityIsDraggableWithDragHandleButton } from './entire-entity-is-draggable-with-drag-handle-button';
import { HoverDragHandle } from './hover-drag-handle';
import { HoverDragHandleOutsideBounds } from './hover-drag-handle-outside-bounds';
import { OnlyDraggableFromDragHandle } from './only-draggable-from-drag-handle';
import { ImpliedDraggable } from './standalone-card';

export function AllDragHandleVariants(): React.JSX.Element {
	return (
		<Stack space="space.100">
			<EntireEntityIsDraggable />
			<OnlyDraggableFromDragHandle />
			<EntireEntityIsDraggableWithDragHandleButton />
			<HoverDragHandle />
			<HoverDragHandleOutsideBounds />
			<ImpliedDraggable />
		</Stack>
	);
}
