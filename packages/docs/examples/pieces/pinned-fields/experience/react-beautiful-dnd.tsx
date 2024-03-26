import React from 'react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { DroppableAreaOverlay } from '../primitives/droppable-area-overlay';
import PinnedFieldsReactBeautifulDndTemplate from '../templates/react-beautiful-dnd';

export default function PinnedFieldReactBeautifulDnd() {
  return (
    <PinnedFieldsReactBeautifulDndTemplate
      idPrefix="react-beautiful-dnd"
      DragDropContext={DragDropContext}
      Draggable={Draggable}
      Droppable={Droppable}
      DroppableAreaOverlay={DroppableAreaOverlay}
    />
  );
}
