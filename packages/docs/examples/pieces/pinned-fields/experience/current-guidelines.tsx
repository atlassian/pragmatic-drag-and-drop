/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { useRef } from 'react';

import { css, jsx } from '@emotion/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

import { useSortableField } from '../../hooks/use-sortable-field';
import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { initialData } from '../data';
import {
  Field,
  type FieldProps,
  PinnedFieldsContainer,
  PinnedFieldsList,
} from '../index';

const draggableFieldStyles = css({
  cursor: 'grab',
});

const type = 'current-guidelines';

function DraggableField({
  index,
  id,
  children,
  ...fieldProps
}: FieldProps & { id: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const { isDragging, closestEdge } = useSortableField({
    id,
    index,
    type,
    ref,
  });

  return (
    <Field
      ref={ref}
      isDisabled={isDragging}
      closestEdge={closestEdge}
      css={draggableFieldStyles}
      {...fieldProps}
    >
      {children}
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </Field>
  );
}

export default function PinnedFieldsWithCurrentGuidelines() {
  const { data } = useTopLevelWiring({ initialData, type });

  return (
    <PinnedFieldsContainer>
      <PinnedFieldsList>
        {data.map((item, index) => (
          <DraggableField
            key={item.id}
            id={item.id}
            label={item.label}
            index={index}
          >
            {item.content}
          </DraggableField>
        ))}
      </PinnedFieldsList>
    </PinnedFieldsContainer>
  );
}
