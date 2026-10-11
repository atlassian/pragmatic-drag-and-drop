import React from 'react';

import { DragDropContext } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/drag-drop-context';
import { Draggable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/draggable';
import { Droppable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/droppable';

import { DroppableAreaOverlay } from '../primitives/droppable-area-overlay';
import PinnedFieldsReactBeautifulDndTemplate from '../templates/react-beautiful-dnd';

export default function PinnedFieldReactBeautifulDnd(): React.JSX.Element {
	return (
		<PinnedFieldsReactBeautifulDndTemplate
			idPrefix="rbd-pdnd-migration"
			DragDropContext={DragDropContext}
			Draggable={Draggable}
			Droppable={Droppable}
			DroppableAreaOverlay={DroppableAreaOverlay}
		/>
	);
}

export function PinnedFieldReactBeautifulDndNoDraggingOutline(): React.JSX.Element {
	return (
		<PinnedFieldsReactBeautifulDndTemplate
			idPrefix="rbd-pdnd-migration--borderless"
			DragDropContext={DragDropContext}
			Draggable={Draggable}
			Droppable={Droppable}
			DroppableAreaOverlay={(props) => <DroppableAreaOverlay {...props} appearance="borderless" />}
		/>
	);
}

export function PinnedFieldReactBeautifulDndSubtle(): React.JSX.Element {
	return (
		<PinnedFieldsReactBeautifulDndTemplate
			idPrefix="rbd-pdnd-migration--subtle"
			DragDropContext={DragDropContext}
			Draggable={Draggable}
			Droppable={Droppable}
			DroppableAreaOverlay={(props) => <DroppableAreaOverlay {...props} appearance="subtle" />}
		/>
	);
}
