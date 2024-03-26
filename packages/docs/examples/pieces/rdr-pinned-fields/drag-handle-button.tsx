/** @jsx jsx */

import { forwardRef } from 'react';

import { css, jsx } from '@emotion/react';

import type { CustomTriggerProps } from '@atlaskit/dropdown-menu';
import FocusRing from '@atlaskit/focus-ring';
import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import { token } from '@atlaskit/tokens';

const dragHandleButtonStyles = css({
  padding: 0,
  border: 'none',
  background: 'transparent',
  borderRadius: '3px',
  opacity: 'var(--action-opacity)',
  color: token('color.icon.subtle', '#626F86'),
  ':focus-visible': {
    opacity: 1,
  },
  cursor: 'grab',
  ':hover': {
    backgroundColor: token(
      'color.background.neutral.subtle.hovered',
      '#091E420F',
    ),
  },
  ':active': {
    backgroundColor: token(
      'color.background.neutral.subtle.pressed',
      '#091E4224',
    ),
  },
});

const selectedStyles = css({
  backgroundColor: token('color.background.selected', '#E9F2FF'),
  color: token('color.icon.selected', '#0C66E4'),
  opacity: 1,
});

type DragHandleButtonProps = Omit<CustomTriggerProps, 'triggerRef'>;

export const DragHandleButton = forwardRef<
  HTMLButtonElement,
  DragHandleButtonProps
>(function DragHandleButton({ isSelected, testId, ...props }, ref) {
  return (
    <FocusRing isInset>
      <button
        ref={ref}
        css={[dragHandleButtonStyles, isSelected && selectedStyles]}
        {...props}
      >
        <div style={{ marginInline: '-2px' }}>
          <DragHandlerIcon label="" size="small" />
        </div>
      </button>
    </FocusRing>
  );
});
