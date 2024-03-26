import React from 'react';

import Icon, { CustomGlyphProps, GlyphProps } from '@atlaskit/icon';

function SubtaskDraggableIconGlyph(props: CustomGlyphProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      role="presentation"
      style={{ pointerEvents: 'none' }}
      {...props}
    >
      <path
        d="M3 18c0 .552.445 1 .993 1h16.014A.994.994 0 0021 18v-1H3v1zm0-7h18V9H3zm0-4h18V6c0-.552-.445-1-.993-1H3.993A.994.994 0 003 6v1zm0 8h18v-2H3z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

/**
 * Subtask reordering uses a custom draggable indicator icon.
 */
export default function SubtaskDraggableIcon(props: Omit<GlyphProps, 'label'>) {
  return <Icon glyph={SubtaskDraggableIconGlyph} label="" {...props} />;
}
