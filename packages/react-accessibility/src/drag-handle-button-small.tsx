import React, { forwardRef } from 'react';

import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import { Box, xcss } from '@atlaskit/primitives';

import { DragHandleButtonBase } from './drag-handle-button-base';
import type { DragHandleButtonProps } from './types';

const iconSmallStyles = xcss({
	display: 'inline-flex',
	marginInline: 'space.negative.050',
});

/**
 * A button with pre-configured styling to look like a drag handle.
 *
 * This component uses a native button because the `@atlaskit/button`
 * cancels `mouseDown` events, which prevents dragging.
 */
export const DragHandleButtonSmall = forwardRef<HTMLButtonElement, DragHandleButtonProps>(
	function DragHandleButton({ label, ...buttonProps }, ref) {
		return (
			<DragHandleButtonBase ref={ref} {...buttonProps}>
				<Box xcss={iconSmallStyles}>
					{/* Relying on currentColor for color */}
					<DragHandlerIcon label={label} size="small" />
				</Box>
			</DragHandleButtonBase>
		);
	},
);
