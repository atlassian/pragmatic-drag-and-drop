/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, type SerializedStyles } from '@emotion/react';

import Avatar from '@atlaskit/avatar';
import DragHandleVerticalIcon from '@atlaskit/icon/core/drag-handle-vertical';
import { token } from '@atlaskit/tokens';

import { subtaskGap, subtaskIdWidth, subtaskInlinePadding } from './constants';
import { LinearInProgressIcon } from './in-progress-icon';
import { LinearPriorityIcon } from './priority-icon';

const subtaskStyles = css({
	background: token('color.background.neutral.subtle'),
	height: 44,
	position: 'relative',
	boxSizing: 'border-box',

	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':not(:last-child)': {
		borderBottom: `${token('border.width')} solid ${token('color.border')}`,
	},
});

const subtaskInnerStyles = css({
	display: 'grid',
	height: '100%',
	gridTemplateColumns: 'auto 1fr auto',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	padding: `0px ${subtaskInlinePadding}px`,
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	gap: subtaskGap,
	alignItems: 'center',
});

const subtaskIdStyles = css({
	color: token('color.text.subtlest'),
	fontSize: 12,
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	width: subtaskIdWidth,
	textAlign: 'center',
});

const subtaskTimeStyles = css({
	color: token('color.text.subtlest'),
	fontSize: 12,
});

const subtaskGroupStyles = css({
	display: 'flex',
	alignItems: 'center',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	gap: subtaskGap,
});

function SubtaskGroup({ children }: { children: ReactNode }) {
	return <div css={subtaskGroupStyles}>{children}</div>;
}

export type SubtaskAppearance = 'default' | 'overlay' | 'disabled';

const subtaskAppearanceStyles: Record<SubtaskAppearance, SerializedStyles> = {
	default: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		':hover': {
			background: token('color.background.neutral.subtle.hovered'),
			'--subtask-drag-handle-icon-display': 'inline-flex',
		},
	}),
	overlay: css({
		background: token('elevation.surface.overlay'),
		boxShadow: token('elevation.shadow.overlay'),
	}),
	disabled: css({
		/**
		 * Using disabled color tokens is recommended,
		 * but does not work for well for images or other
		 * components we cannot override.
		 */
		opacity: 0.4,
	}),
};

const dragHandlerIconStyles = css({
	position: 'absolute',
	left: 4,
	top: 10,
});

export type SubtaskProps = HTMLAttributes<HTMLDivElement> & {
	id: string;
	title: string;
	appearance?: SubtaskAppearance;
	isHovering?: boolean;
};

export const Subtask = forwardRef<HTMLDivElement, SubtaskProps>(function Subtask(
	{ id, title, appearance = 'default', isHovering = false, children, ...props },
	ref,
) {
	return (
		<div ref={ref} css={[subtaskStyles]} {...props}>
			<div css={[subtaskInnerStyles, subtaskAppearanceStyles[appearance]]}>
				<SubtaskGroup>
					{isHovering && (
						<span css={dragHandlerIconStyles}>
							<DragHandleVerticalIcon
								color="currentColor"
								spacing="spacious"
								label=""
								size="small"
							/>
						</span>
					)}
					<LinearPriorityIcon color={token('color.icon')} />
					<span css={subtaskIdStyles}>{id}</span>
					<LinearInProgressIcon />
				</SubtaskGroup>
				<span>{title}</span>
				<SubtaskGroup>
					<time css={subtaskTimeStyles}>25 Apr</time>
					<Avatar size="xsmall" />
				</SubtaskGroup>
			</div>
			{children}
		</div>
	);
});

const subtaskPreviewStyles = css({
	background: token('elevation.surface.overlay'),
	boxShadow: token('elevation.shadow.overlay'),
	padding: '0px 8px',
	height: 36,
	borderRadius: 4,
});

export const SubtaskPreview = forwardRef<HTMLDivElement, SubtaskProps>(function SubtaskPreview(
	{ id, title, appearance = 'default', isHovering = false, children, ...props },
	ref,
) {
	return (
		<div ref={ref} css={[subtaskStyles]} {...props}>
			<div css={[subtaskInnerStyles, subtaskAppearanceStyles[appearance], subtaskPreviewStyles]}>
				<LinearInProgressIcon />
				<span>{title}</span>
			</div>
			{children}
		</div>
	);
});
