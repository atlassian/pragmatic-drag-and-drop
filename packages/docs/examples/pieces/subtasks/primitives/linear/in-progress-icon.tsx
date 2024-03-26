import React from 'react';

import { token } from '@atlaskit/tokens';

export function LinearInProgressIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-label="In Progress"
    >
      <rect
        x="1"
        y="1"
        width="12"
        height="12"
        rx="6"
        stroke={token('color.icon.warning', 'none')}
        strokeWidth="2"
        fill="none"
      ></rect>
      <path
        fill={token('color.icon.warning', 'none')}
        stroke="none"
        d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 7 z"
        transform="translate(3.5,3.5)"
      ></path>
    </svg>
  );
}
