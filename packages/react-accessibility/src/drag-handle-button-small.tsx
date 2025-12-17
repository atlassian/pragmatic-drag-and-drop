import React, { forwardRef } from 'react';

import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import { fg } from '@atlaskit/platform-feature-flags';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
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

// TODO: will run full deprecation process later. For now just want people to stop using this.
// eslint-disable-next-line @repo/internal/deprecations/deprecation-ticket-required
/**
 * A button with pre-configured styling to look like a drag handle.
 *
 * This component uses a native button because the `@atlaskit/button`
 * cancels `mouseDown` events, which prevents dragging.
 *
 * @deprecated Please use `DragHandleButton`.
 *
 * Rationale:
 *
 * - `DragHandleButtonSmall` uses a tiny icon size that is no longer supported by our icon system
 *   (the smallest icon size is now `12px` x `12px`)
 * - Icons smaller than `12px` x `12px` are not good for visibility and accessibility
 * - The small hitbox of `DragHandleButtonSmall` (`8px` x `16px`) is below our `24px` x `24px`
 *   minimum hit target size for accessibility. [More details](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
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
					<DragHandleVerticalIcon color="currentColor" label={label} size="small" />
				</Box>
			</DragHandleButtonBase>
		);
	},
);
