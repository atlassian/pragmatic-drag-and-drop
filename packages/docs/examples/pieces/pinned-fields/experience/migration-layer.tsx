import React from 'react';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';

import { DroppableAreaOverlay } from '../primitives/droppable-area-overlay';
import PinnedFieldsReactBeautifulDndTemplate from '../templates/react-beautiful-dnd';

export default function PinnedFieldReactBeautifulDnd() {
  return (
    <PinnedFieldsReactBeautifulDndTemplate
      idPrefix="rbd-pdnd-migration"
      DragDropContext={DragDropContext}
      // @ts-expect-error - rbd12 vs rbd13 API
      Draggable={Draggable}
      // @ts-expect-error - rbd12 vs rbd13 API
      Droppable={Droppable}
      DroppableAreaOverlay={DroppableAreaOverlay}
    />
  );
}

export function PinnedFieldReactBeautifulDndNoDraggingOutline() {
  return (
    <PinnedFieldsReactBeautifulDndTemplate
      idPrefix="rbd-pdnd-migration--borderless"
      DragDropContext={DragDropContext}
      // @ts-expect-error - rbd12 vs rbd13 API
      Draggable={Draggable}
      // @ts-expect-error - rbd12 vs rbd13 API
      Droppable={Droppable}
      DroppableAreaOverlay={props => (
        <DroppableAreaOverlay {...props} appearance="borderless" />
      )}
    />
  );
}

export function PinnedFieldReactBeautifulDndSubtle() {
  return (
    <PinnedFieldsReactBeautifulDndTemplate
      idPrefix="rbd-pdnd-migration--subtle"
      DragDropContext={DragDropContext}
      // @ts-expect-error - rbd12 vs rbd13 API
      Draggable={Draggable}
      // @ts-expect-error - rbd12 vs rbd13 API
      Droppable={Droppable}
      DroppableAreaOverlay={props => (
        <DroppableAreaOverlay {...props} appearance="subtle" />
      )}
    />
  );
}
