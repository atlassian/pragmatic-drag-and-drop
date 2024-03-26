import React from 'react';

import { Stack } from '@atlaskit/primitives';

import { FieldsContainer } from './container';
import { defaultDetailsItems, defaultItems } from './data';
import List from './list';

export default function PinnedFieldsPrototype() {
  return (
    <Stack space="space.200">
      <FieldsContainer title="Your pinned fields" isPinnedFields>
        <List isSortable defaultItems={defaultItems} />
      </FieldsContainer>
      <FieldsContainer title="Details">
        <List defaultItems={defaultDetailsItems} />
      </FieldsContainer>
    </Stack>
  );
}
