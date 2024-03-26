import React from 'react';

export function LinearPriorityIcon({
  color = 'currentColor',
}: {
  color?: string;
}) {
  return (
    <svg
      fill={color}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-label="High Priority"
    >
      <rect x="1" y="8" width="3" height="6" rx="1"></rect>
      <rect x="6" y="5" width="3" height="9" rx="1"></rect>
      <rect x="11" y="2" width="3" height="12" rx="1"></rect>
    </svg>
  );
}
