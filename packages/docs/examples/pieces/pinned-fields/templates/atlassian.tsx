import React, { type ReactElement } from 'react';

import {
  type ReorderItem,
  useTopLevelWiring,
} from '../../hooks/use-top-level-wiring';
import { type DataItem, initialData } from '../data';
import { PinnedFieldsContainer, PinnedFieldsList } from '../index';

export type DraggableFieldProps = {
  index: number;
  item: DataItem;
  data: DataItem[];
  reorderItem: ReorderItem;
};

type PinnedFieldsAtlassianTemplateProps = {
  instanceId: string;
  DraggableField: (props: DraggableFieldProps) => ReactElement;
};

export default function PinnedFieldsAtlassianTemplate({
  instanceId,
  DraggableField,
}: PinnedFieldsAtlassianTemplateProps) {
  const { data, reorderItem } = useTopLevelWiring({
    initialData,
    type: instanceId,
  });

  return (
    <PinnedFieldsContainer>
      <PinnedFieldsList>
        {data.map((item, index) => (
          <DraggableField
            key={item.id}
            index={index}
            item={item}
            data={data}
            reorderItem={reorderItem}
          />
        ))}
      </PinnedFieldsList>
    </PinnedFieldsContainer>
  );
}
