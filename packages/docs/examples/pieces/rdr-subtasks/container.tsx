import React, { ReactNode } from 'react';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import Button, { IconButton } from '@atlaskit/button/new';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import MoreIcon from '@atlaskit/icon/glyph/more';
import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

const containerStyles = xcss({
  padding: 'space.100',
  borderRadius: 'border.radius.200',
  backgroundColor: 'elevation.surface.sunken',
  width: '50vw',
});

export function BacklogContainer({ children }: { children: ReactNode }) {
  return (
    <Stack space="space.100" xcss={containerStyles}>
      <BacklogHeader />
      {children}
    </Stack>
  );
}

const headerTitleInsetStyles = xcss({
  paddingLeft: 'space.150',
});

const headerAvatarGroupInsetStyles = xcss({
  paddingLeft: 'space.300',
});

const sprintTitleStyles = xcss({
  fontWeight: 600,
});

const subtlestTextStyles = xcss({
  color: 'color.text.subtlest',
});

function BacklogHeader() {
  return (
    <Stack space="space.050">
      <Inline
        spread="space-between"
        alignBlock="center"
        xcss={headerTitleInsetStyles}
      >
        <Inline alignBlock="center">
          <ChevronDownIcon label="" />
          <Inline space="space.100" alignBlock="center">
            <Box xcss={sprintTitleStyles}>Sprint Title</Box>
            <Box xcss={subtlestTextStyles}>29 Aug — 12 Sep</Box>
            <Box xcss={subtlestTextStyles}>(23 issues)</Box>
          </Inline>
        </Inline>
        <Inline space="space.100" alignBlock="center">
          <Inline space="space.050">
            <Badge>0d</Badge>
            <Badge appearance="primary">0d</Badge>
            <Badge appearance="added">0d</Badge>
          </Inline>
          <Button>Complete sprint</Button>
          <IconButton icon={MoreIcon} label="more actions" />
        </Inline>
      </Inline>
      <Inline
        space="space.050"
        alignBlock="center"
        xcss={headerAvatarGroupInsetStyles}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Avatar key={index} size="small" />
        ))}
        <IconButton icon={MoreIcon} appearance="subtle" label="more actions" />
      </Inline>
    </Stack>
  );
}
