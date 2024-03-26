/** @jsx jsx */

import { jsx } from '@emotion/react';

import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import { Box, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import type { DragHandleIconProps } from './types';

const iconSmallStyles = xcss({
  display: 'inline-flex',
  marginInline: token('space.negative.050'),
});

export function DragHandleIconSmall({ label }: DragHandleIconProps) {
  return (
    <Box xcss={iconSmallStyles}>
      <DragHandlerIcon
        label={label}
        size="small"
        primaryColor={token('color.icon.subtle')}
      />
    </Box>
  );
}
