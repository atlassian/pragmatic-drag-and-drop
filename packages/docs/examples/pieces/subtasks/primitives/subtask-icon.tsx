import React from 'react';

import SubtaskDraggableIcon from './subtask-draggable-icon';

export function SubtaskObjectIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_80_3800)">
        <rect width="14" height="14" rx="2" fill="#4AADE8" />
        <path
          d="M12 0H2C0.89543 0 0 0.89543 0 2V12C0 13.1046 0.89543 14 2 14H12C13.1046 14 14 13.1046 14 12V2C14 0.89543 13.1046 0 12 0Z"
          fill="#4BAEE8"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.8 3.5C3.63431 3.5 3.5 3.63431 3.5 3.8V7.2C3.5 7.36569 3.63431 7.5 3.8 7.5H7.2C7.36569 7.5 7.5 7.36569 7.5 7.2V3.8C7.5 3.63431 7.36569 3.5 7.2 3.5H3.8ZM2.5 3.8C2.5 3.08203 3.08203 2.5 3.8 2.5H7.2C7.91797 2.5 8.5 3.08203 8.5 3.8V7.2C8.5 7.91797 7.91797 8.5 7.2 8.5H3.8C3.08203 8.5 2.5 7.91797 2.5 7.2V3.8Z"
          fill="white"
        />
        <path
          d="M10.2 6H6.8C6.35817 6 6 6.35817 6 6.8V10.2C6 10.6418 6.35817 11 6.8 11H10.2C10.6418 11 11 10.6418 11 10.2V6.8C11 6.35817 10.6418 6 10.2 6Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.8 6.5C6.63431 6.5 6.5 6.63431 6.5 6.8V10.2C6.5 10.3657 6.63431 10.5 6.8 10.5H10.2C10.3657 10.5 10.5 10.3657 10.5 10.2V6.8C10.5 6.63431 10.3657 6.5 10.2 6.5H6.8ZM5.5 6.8C5.5 6.08203 6.08203 5.5 6.8 5.5H10.2C10.918 5.5 11.5 6.08203 11.5 6.8V10.2C11.5 10.918 10.918 11.5 10.2 11.5H6.8C6.08203 11.5 5.5 10.918 5.5 10.2V6.8Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_80_3800">
          <rect width="14" height="14" rx="2" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function SubtaskIcon({ isIconHidden = false }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        opacity: isIconHidden ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'var(--subtask-drag-handle-icon-display, none)' }}>
        <SubtaskDraggableIcon />
      </div>
      <SubtaskObjectIcon />
    </div>
  );
}
