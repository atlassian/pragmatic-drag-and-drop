import React, { forwardRef } from 'react';

import DragHandleVerticalIcon from '@atlaskit/icon/core/migration/drag-handle-vertical--drag-handler';

import { DragHandleButtonBase } from './drag-handle-button-base';
import type { DragHandleButtonProps } from './types';

/**
 * A button with pre-configured styling to look like a drag handle.
 *
 * This component uses a native button because the `@atlaskit/button`
 * cancels `mouseDown` events, which prevents dragging.
 */
export const DragHandleButton = forwardRef<HTMLButtonElement, DragHandleButtonProps>(
	function DragHandleButton({ label, ...buttonProps }, ref) {
		return (
			<DragHandleButtonBase ref={ref} {...buttonProps}>
				{/* Relying on currentColor for color */}
				<DragHandleVerticalIcon
					color="currentColor"
					spacing="spacious"
					label={label}
					size="small"
				/>
			</DragHandleButtonBase>
		);
	},
);
