/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const subtaskContainerStyles = css({
	// for parent placement
	flexGrow: 1,
	flexBasis: 0,
	background: token('elevation.surface'),
	border: `${token('border.width')} solid ${token('color.border')}`,
	maxWidth: 560,
});

type SubtaskContainerProps = HTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
};

export const SubtaskContainer = forwardRef<HTMLDivElement, SubtaskContainerProps>(
	function SubtaskContainer({ children, ...props }, ref) {
		return (
			<div ref={ref} css={subtaskContainerStyles} {...props}>
				{children}
			</div>
		);
	},
);
