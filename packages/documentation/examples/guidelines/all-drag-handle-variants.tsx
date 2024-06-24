import React from 'react';

import { Stack } from '@atlaskit/primitives';

import { EntireEntityIsDraggable } from './entire-entity-is-draggable';
import { HiddenDragHandle } from './hidden-drag-handle';
import { SmallHiddenDragHandle } from './small-hidden-drag-handle';
import { UsingDragHandle } from './using-drag-handle';

export function AllDragHandleVariants() {
	return (
		<Stack space="space.100">
			<EntireEntityIsDraggable />
			<HiddenDragHandle />
			<SmallHiddenDragHandle />
			<UsingDragHandle />
		</Stack>
	);
}
