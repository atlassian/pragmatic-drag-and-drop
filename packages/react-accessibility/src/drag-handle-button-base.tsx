/** @jsx jsx */

import { forwardRef } from 'react';

import { css, jsx, type SerializedStyles } from '@emotion/react';

import FocusRing from '@atlaskit/focus-ring';
import { token } from '@atlaskit/tokens';

import type { DragHandleButtonProps } from './types';

/**
 * Cannot use `@atlaskit/button` here because it cancels `mousedown` events
 * which prevents dragging.
 */
const buttonStyles = css({
  borderRadius: token('border.radius.100'),
  padding: token('space.0'),
  width: 'max-content',
  border: 'none',
  cursor: 'grab',
  display: 'flex',
});

export type DragHandleButtonAppearance = 'default' | 'subtle' | 'selected';

const buttonAppearanceStyles: Record<
  DragHandleButtonAppearance,
  SerializedStyles
> = {
  default: css({
    backgroundColor: token('color.background.neutral'),
    ':hover': {
      backgroundColor: token('color.background.neutral.hovered'),
    },
    ':active': {
      backgroundColor: token('color.background.neutral.pressed'),
    },
  }),
  subtle: css({
    backgroundColor: token('color.background.neutral.subtle'),
    ':hover': {
      backgroundColor: token('color.background.neutral.subtle.hovered'),
    },
    ':active': {
      backgroundColor: token('color.background.neutral.subtle.pressed'),
    },
  }),
  selected: css({
    backgroundColor: token('color.background.selected'),
    color: token('color.text.selected'),
  }),
};

/**
 * A button with pre-configured styling to look like a drag handle.
 *
 * This component uses a native button because the `@atlaskit/button`
 * cancels `mouseDown` events, which prevents dragging.
 */
export const DragHandleButtonBase = forwardRef<
  HTMLButtonElement,
  Omit<DragHandleButtonProps, 'label'>
>(function DragHandleButton(
  {
    children,
    isSelected = false,
    testId,
    appearance: appearanceProp = 'default',
    /**
     * Defaulting to `button` instead of `submit` (native default in some cases).
     *
     * A type of `submit` only makes sense in a form context, and isn't very
     * relevant to a drag handle.
     *
     * `@atlaskit/button` also defaults to a type of `button` as well, as it
     * is more semantically appropriate in a wider range of cases.
     */
    type = 'button',
    ...buttonProps
  },
  ref,
) {
  const appearance = isSelected ? 'selected' : appearanceProp;

  return (
    <FocusRing>
      <button
        ref={ref}
        css={[buttonStyles, buttonAppearanceStyles[appearance]]}
        data-testid={testId}
        type={type}
        {...buttonProps}
      >
        {children}
      </button>
    </FocusRing>
  );
});
