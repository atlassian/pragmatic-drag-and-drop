/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import RecentIcon from '@atlaskit/icon/core/migration/clock--recent';
import EditorTextStyleIcon from '@atlaskit/icon/core/migration/text-style--editor-text-style';
import ChevronDownCircleIcon from '@atlaskit/icon/utility/migration/chevron-down--chevron-down-circle';
import { token } from '@atlaskit/tokens';

const subtaskContainerStyles = css({
	// for parent placement
	flexGrow: 1,
	flexBasis: 0,
	// background: token('elevation.surface'),
	maxWidth: 560,
});

type SubtaskContainerProps = HTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
};

const headingRowStyles = css({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, 1fr)',
	border: `1px solid ${token('color.border')}`,
	borderInlineWidth: 0,
});

const headingStyles = css({
	display: 'flex',
	alignItems: 'center',
	padding: 8,
	gap: 4,
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':not(:first-of-type)': {
		borderLeft: `1px solid ${token('color.border')}`,
	},
});

function Heading({ children }: { children: ReactNode }) {
	return <div css={headingStyles}>{children}</div>;
}

export const SubtaskContainer = forwardRef<HTMLDivElement, SubtaskContainerProps>(
	function SubtaskContainer({ children, ...props }, ref) {
		return (
			<div ref={ref} css={subtaskContainerStyles} {...props}>
				{/* eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766 */}
				<div style={{ paddingLeft: 24 }}>
					<div css={headingRowStyles}>
						<Heading>
							<EditorTextStyleIcon color="currentColor" label="" LEGACY_size="small" />
							Name
						</Heading>
						<Heading>
							<RecentIcon color="currentColor" label="" LEGACY_size="small" />
							Date Created
						</Heading>
						<Heading>
							<ChevronDownCircleIcon
								color="currentColor"
								label=""
								LEGACY_size="small"
								spacing="compact"
							/>
							Status
						</Heading>
					</div>
				</div>
				{children}
			</div>
		);
	},
);
