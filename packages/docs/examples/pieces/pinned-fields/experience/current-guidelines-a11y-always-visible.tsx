/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { useRef } from 'react';

import { css, jsx } from '@emotion/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

import { useSortableField } from '../../hooks/use-sortable-field';
import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { MenuButton } from '../../menu-button';
import type { ReorderItem } from '../../subtasks/hooks/use-top-level-wiring';
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

const type = 'current-guidelines--a11y-always-visible';

function DraggableField({
  index,
  id,
  children,
  reorderItem,
  data,
  ...fieldProps
}: FieldProps & {
  id: string;
  reorderItem: ReorderItem;
  data: unknown[];
  index: number;
}) {
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
      <span
        style={{
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
          position: 'absolute',
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
          top: 0,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
          right: 0,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
          padding: 8,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
          background: 'white',
        }}
      >
        <MenuButton
          id={id}
          reorderItem={reorderItem}
          index={index}
          dataLength={data.length}
          size="small"
        />
      </span>
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </Field>
  );
}

export default function PinnedFieldsWithCurrentGuidelinesA11yAlwaysVisible() {
  const { data, reorderItem } = useTopLevelWiring({ initialData, type });

  return (
    <PinnedFieldsContainer>
      <PinnedFieldsList>
        {data.map((item, index) => (
          <DraggableField
            key={item.id}
            id={item.id}
            label={item.label}
            index={index}
            reorderItem={reorderItem}
            data={data}
          >
            {item.content}
          </DraggableField>
        ))}
      </PinnedFieldsList>
    </PinnedFieldsContainer>
  );
}
