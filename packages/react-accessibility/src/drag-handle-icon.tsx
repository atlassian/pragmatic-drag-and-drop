import React from 'react';

import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import { token } from '@atlaskit/tokens';

import type { DragHandleIconProps } from './types';

export function DragHandleIcon({ label }: DragHandleIconProps) {
  return (
    <DragHandlerIcon label={label} primaryColor={token('color.icon.subtle')} />
  );
}
