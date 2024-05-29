/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { css, jsx } from '@emotion/react';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { token } from '@atlaskit/tokens';

const containerStyles = css({
  // for parent placement
  flexGrow: 1,
  flexBasis: 0,
  maxWidth: 400,
  minWidth: 300,

  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${token('color.border')}`,
  borderRadius: 4,
});

const headerStyles = css({
  background: token('elevation.surface.overlay'),
  fontWeight: 700,
  fontSize: 14,
  lineHeight: '20px',
  padding: 12,
  borderBottom: `1px solid ${token('color.border')}`,
  borderRadius: '4px 4px 0px 0px',
});

const listStyles = css({
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  // border: '1px solid transparent',
  borderRadius: 4,
  position: 'relative',

  /**
   * Adding some small extra padding so that drop indicators
   * at the top and bottom aren't against the edge of the container.
   */
  padding: '4px 8px',
});

const fieldStyles = css({
  display: 'grid',
  gap: 24,
  alignItems: 'start',
  padding: '8px 4px',
  margin: '4px 0px',
  gridTemplateColumns: 'min(40%, 140px) 1fr',
  background: token('elevation.surface'),
  borderRadius: 3,
  position: 'relative',
});

const fieldLabelStyles = css({
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '16px',
  color: token('color.text.subtle'),
  // padding: '4px 0px',
  minHeight: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div css={fieldLabelStyles}>{children}</div>;
}

const fieldDisabledStyles = css({
  /**
   * Using disabled color tokens is recommended,
   * but does not work for well for images or other
   * components we cannot override.
   */
  opacity: 0.4,
});

const fieldDraggingStyles = css({
  background: token('elevation.surface.overlay'),
  boxShadow: token('elevation.shadow.overlay'),
});

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  children: ReactNode;
  isDisabled?: boolean;
  closestEdge?: Edge | null;
  className?: string;
  isDragging?: boolean;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    children,
    className,
    isDisabled = false,
    closestEdge = null,
    isDragging = false,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      css={[
        fieldStyles,
        isDisabled && fieldDisabledStyles,
        isDragging && fieldDraggingStyles,
      ]}
// eslint-disable-next-line @atlaskit/ui-styling-standard/no-classname-prop -- Ignored via go/DSP-18766
      className={className}
      {...props}
    >
      <div css={[fieldLabelStyles, isDisabled && fieldDisabledStyles]}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
});

export const PinnedFieldsList = forwardRef(function DroppableArea(
  { children, ...props }: HTMLAttributes<HTMLDivElement>,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} css={listStyles} {...props}>
      {children}
    </div>
  );
});

export function PinnedFieldsContainer({ children }: { children: ReactNode }) {
  return (
    <div css={containerStyles}>
      <div css={headerStyles}>Pinned fields</div>
      {children}
    </div>
  );
}

const fieldContentWithIconStyles = css({
  display: 'grid',
  gridTemplateColumns: '24px 1fr',
  alignItems: 'center',
  gap: 12,
});

const fieldContentIconStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24,
  height: 24,
  pointerEvents: 'none',
});

/**
 * Used to emulate a select
 */
export function FieldContentWithIcon({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div css={fieldContentWithIconStyles}>
      <div css={fieldContentIconStyles}>{icon}</div>
      <div>{children}</div>
    </div>
  );
}
