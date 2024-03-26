import React from 'react';

import Icon from '@atlaskit/icon';
import type { CustomGlyphProps } from '@atlaskit/icon/types';

const CustomGlyph = (props: CustomGlyphProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    data-testid={props['data-testid']}
    aria-label={props['aria-label']}
    className={props.className}
  >
    <path
      d="M8.045319 12.806152l4.5-2.7c.5-.3 1.1-.1 1.3.4s.2 1.1-.3 1.3l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7z"
      fill="#0065ff"
    />
    <path
      d="M12.545319 5.806152c.5-.3 1.1-.1 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z"
      fill="#2684ff"
    />
    <path
      d="M12.545319 1.506152c.5-.3 1.1-.2 1.3.3s.2 1.1-.3 1.4l-5 3c-.3.2-.7.2-1 0l-5-3c-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3l4.4 2.7 4.5-2.7z"
      fill="#4c9aff"
    />
  </svg>
);

export function MinorPriorityIcon() {
  return <Icon glyph={CustomGlyph} label="" size="small" />;
}
