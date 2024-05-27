import React, { type ReactNode } from 'react';

import { Box, Stack, xcss } from '@atlaskit/primitives';

const containerStyles = xcss({
  // @ts-expect-error
  borderRadius: '4px',
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderColor: 'color.border',
  // overflow: 'hidden',
  minWidth: '400px',
});

const headerStyles = xcss({
  backgroundColor: 'elevation.surface.overlay',
  fontWeight: 700,
  borderWidth: 'border.width.0',
  borderBottomWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'color.border',
  lineHeight: '20px',
  padding: 'space.150',
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
});

const pinnedFieldsHeaderStyles = xcss({
  // paddingLeft: 'space.200',
});

export function FieldsContainer({
  children,
  title,
  isPinnedFields = false,
}: {
  children: ReactNode;
  title: string;
  isPinnedFields?: boolean;
}) {
  return (
    <Stack xcss={containerStyles}>
      <Box xcss={[headerStyles, isPinnedFields && pinnedFieldsHeaderStyles]}>
        {title}
      </Box>
      <Stack>{children}</Stack>
    </Stack>
  );
}
