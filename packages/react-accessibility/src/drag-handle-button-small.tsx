import React, { forwardRef } from 'react';

import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import DragHandlerIcon from '@atlaskit/icon/core/migration/drag-handle-vertical--drag-handler';
import { fg } from '@atlaskit/platform-feature-flags';
import { Box, xcss } from '@atlaskit/primitives';

import { DragHandleButtonBase } from './drag-handle-button-base';
import type { DragHandleButtonProps } from './types';

const iconSmallStyles = xcss({
	display: 'inline-flex',
	marginInline: 'space.negative.050',
});

const iconSmallStylesNew = xcss({
	display: 'inline-flex',
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
				<Box
					xcss={
						fg('platform-component-visual-refresh') || fg('platform-visual-refresh-icons')
							? iconSmallStylesNew
							: iconSmallStyles
					}
				>
					{/* Relying on currentColor for color */}
					{fg('platform-component-visual-refresh') ? (
						<DragHandleVerticalIcon color="currentColor" label={label} size="small" />
					) : (
						<DragHandlerIcon color="currentColor" label={label} LEGACY_size="small" size="small" />
					)}
				</Box>
			</DragHandleButtonBase>
		);
	},
);
