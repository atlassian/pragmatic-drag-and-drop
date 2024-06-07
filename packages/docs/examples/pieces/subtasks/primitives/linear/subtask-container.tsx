/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const subtaskContainerStyles = css({
	// for parent placement
	flexGrow: 1,
	flexBasis: 0,
	background: token('elevation.surface'),
	border: `1px solid ${token('color.border')}`,
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
