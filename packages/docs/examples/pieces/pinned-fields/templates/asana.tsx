import React, { ReactElement } from 'react';

import CalendarIcon from '@atlaskit/icon/glyph/calendar';
import CheckCircleOutlineIcon from '@atlaskit/icon/glyph/check-circle-outline';
import EditIcon from '@atlaskit/icon/glyph/edit';
import IssuesIcon from '@atlaskit/icon/glyph/issues';
import LabelIcon from '@atlaskit/icon/glyph/label';
import PersonIcon from '@atlaskit/icon/glyph/person';
import RecentIcon from '@atlaskit/icon/glyph/recent';

import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';

export type DataItem = {
  id: string;
  label: string;
  icon: ReactElement;
};

const initialData: DataItem[] = [
  { icon: <PersonIcon label="" />, label: 'Created by', id: 'created-by' },
  { icon: <CalendarIcon label="" />, label: 'Due date', id: 'due' },
  { icon: <RecentIcon label="" />, label: 'Created on', id: 'created-on' },
  {
    icon: <EditIcon label="" />,
    label: 'Last modified on',
    id: 'last-modified-on',
  },
  {
    icon: <CheckCircleOutlineIcon label="" />,
    label: 'Completed on',
    id: 'completed-on',
  },
  { icon: <IssuesIcon label="" />, label: 'Projects', id: 'projects' },
  { icon: <LabelIcon label="" />, label: 'Tags', id: 'tags' },
];

export type DraggableFieldProps = { index: number; item: DataItem };

type AsanaFieldsTemplateProps = {
  DraggableField: (props: DraggableFieldProps) => ReactElement;
  instanceId: string;
};

export default function AsanaFieldsTemplate({
  DraggableField,
  instanceId,
}: AsanaFieldsTemplateProps) {
  const { data } = useTopLevelWiring({ initialData, type: instanceId });
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {data.map((item, index) => (
        <DraggableField key={item.id} index={index} item={item} />
      ))}
    </div>
  );
}
