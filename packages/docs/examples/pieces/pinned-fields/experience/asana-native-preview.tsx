import React, { useRef } from 'react';

import ReactDOM from 'react-dom';

import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

import { useSortableField } from '../../hooks/use-sortable-field';
import { DropIndicator } from '../primitives/asana/drop-indicator';
import { Field, FieldPreview } from '../primitives/asana/field';
import AsanaFieldsTemplate, { type DraggableFieldProps } from '../templates/asana';

const type = 'asana--native-preview';

function DraggableField({ index, item }: DraggableFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { isHovering, closestEdge } = useSortableField({
    id: item.id,
    index,
    type,
    ref,
    shouldHideDropIndicatorForNoopTargets: false,
    isSticky: false,
    shouldHideNativeDragPreview: false,
    onGenerateDragPreview({ nativeSetDragImage }) {
      setCustomNativeDragPreview({
        nativeSetDragImage,
        render({ container }) {
          ReactDOM.render(<FieldPreview>{item.label}</FieldPreview>, container);
          return () => ReactDOM.unmountComponentAtNode(container);
        },
      });
    },
  });

  return (
    <Field
      ref={ref}
      icon={isHovering ? <DragHandlerIcon label="" /> : item.icon}
    >
      {item.label}
      {closestEdge && <DropIndicator edge={closestEdge} />}
    </Field>
  );
}

export default function AsanaFieldsWithNativePreview() {
  return (
    <AsanaFieldsTemplate instanceId={type} DraggableField={DraggableField} />
  );
}
