/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { forwardRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import type { CustomTriggerProps } from '@atlaskit/dropdown-menu';
import FocusRing from '@atlaskit/focus-ring';
import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import { token } from '@atlaskit/tokens';

const dragHandleButtonStyles = css({
	padding: 0,
	border: 'none',
	background: 'transparent',
	// eslint-disable-next-line @atlaskit/design-system/no-unsafe-design-token-usage
	borderRadius: token('radius.small', '3px'),
	opacity: 'var(--action-opacity)',
	color: token('color.icon.subtle', '#626F86'),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':focus-visible': {
		opacity: 1,
	},
	cursor: 'grab',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':hover': {
		backgroundColor: token('color.background.neutral.subtle.hovered', '#091E420F'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':active': {
		backgroundColor: token('color.background.neutral.subtle.pressed', '#091E4224'),
	},
});

const subtaskSpecificHandleStyles = css({
	width: 24,
	height: 24,
	marginLeft: -4,
});

const selectedStyles = css({
	backgroundColor: token('color.background.selected', '#E9F2FF'),
	color: token('color.icon.selected', '#0C66E4'),
	opacity: 1,
});

type DragHandleButtonProps = Omit<CustomTriggerProps, 'triggerRef'>;

export const DragHandleButton = forwardRef<HTMLButtonElement, DragHandleButtonProps>(
	function DragHandleButton({ isSelected, testId, ...props }, ref) {
		return (
			<FocusRing isInset>
				<button
					ref={ref}
					css={[dragHandleButtonStyles, subtaskSpecificHandleStyles, isSelected && selectedStyles]}
					{...props}
				>
					<DragHandleVerticalIcon color="currentColor" spacing="spacious" label="" size="small" />
				</button>
			</FocusRing>
		);
	},
);
