import type { ButtonHTMLAttributes } from 'react';

export type DragHandleButtonAppearance = 'default' | 'subtle' | 'selected';

export type DragHandleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * The base styling to apply to the button
   */
  appearance?: DragHandleButtonAppearance;
  /**
   * Text used to describe what the button is in context
   */
  label: string;
  /**
   * Change the style to indicate the button is selected
   */
  isSelected?: boolean;
  /**
   * A `testId` prop is provided for specified elements, which is a unique string
   * that appears as a data attribute `data-testid` in the rendered code,
   * serving as a hook for automated tests
   */
  testId?: string;
};

export type DragHandleIconProps = {
  label: string;
};
