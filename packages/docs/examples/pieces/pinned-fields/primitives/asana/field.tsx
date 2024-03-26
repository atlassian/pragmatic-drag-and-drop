/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { forwardRef, ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { gapSize } from './constants';

/**
 * Used to create the visual gaps between items, without having real gaps.
 *
 * This is to avoid using stickiness, which would have different behavior
 * when the pointer leaves the list.
 */
const fieldContainerStyles = css({
  padding: `${gapSize / 2}px 0px`,
  width: 'max-content',
});

const fieldStyles = css({
  boxSizing: 'border-box',
  width: 304,
  background: token('elevation.surface'),
  border: `1px solid ${token('color.border')}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: 8,

  lineHeight: '24px',

  position: 'relative',
  cursor: 'grab',

  ':hover': {
    borderColor: token('color.border.bold'),
  },
});

export type FieldProps = {
  children: ReactNode;
  icon: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { children, icon },
  ref,
) {
  return (
    <div ref={ref} css={fieldContainerStyles}>
      <div css={fieldStyles}>
        {icon}
        {children}
      </div>
    </div>
  );
});

const fieldPreviewStyles = css({
  borderColor: token('color.border.selected'),
  width: 'max-content',

  /**
   * The Asana previews have a bit more vertical padding
   */
  padding: 12,
  /**
   * Because there is no icon the left padding increases a bit to keep the
   * text looking centered
   */
  paddingLeft: 16,
  /**
   * Matches the Asana preview
   */
  paddingRight: 48,
});

export function FieldPreview({ children }: { children: ReactNode }) {
  return <div css={[fieldStyles, fieldPreviewStyles]}>{children}</div>;
}
