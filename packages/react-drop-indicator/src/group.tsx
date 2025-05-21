/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, type ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

const activeStyles = css({
	backgroundColor: token('color.background.information'),
	borderRadius: token('border.radius.050'),
	outlineOffset: token('space.075'),
	outlineWidth: token('border.width.outline'),
	outlineStyle: 'solid',
	outlineColor: token('color.border.selected'),
});
/**
 * A drop indicator to be used when dragging over a group of items
 */
export const GroupDropIndicator = forwardRef<
	HTMLDivElement,
	{
		children: ReactNode;
		isActive: boolean;
		testId?: string;
	}
>(function GroupDropIndicator({ children, isActive, testId }, forwardedRef) {
	return (
		<div ref={forwardedRef} css={[isActive && activeStyles]} data-testid={testId}>
			{children}
		</div>
	);
});
