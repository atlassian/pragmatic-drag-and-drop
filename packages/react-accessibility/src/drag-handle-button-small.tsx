import React, { forwardRef } from 'react';

import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import DragHandlerIconNew from '@atlaskit/icon/utility/drag-handle';
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
				<Box xcss={fg('platform-component-visual-refresh') ? iconSmallStylesNew : iconSmallStyles}>
					{/* Relying on currentColor for color */}
					{fg('platform-component-visual-refresh') ? (
						<DragHandlerIconNew color="currentColor" label={label} />
					) : (
						<DragHandlerIcon label={label} size="small" />
					)}
				</Box>
			</DragHandleButtonBase>
		);
	},
);
