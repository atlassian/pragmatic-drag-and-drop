/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const droppableAreaOverlayStyles = css({
	border: `${token('border.width.selected')} dashed transparent`,
	borderRadius: token('radius.small', '3px'),
	transition: 'background-color 300ms ease, border 300ms ease',
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	pointerEvents: 'none',
	boxSizing: 'border-box',
});

const droppableAreaOverlayDraggingFromStyles = {
	default: css({
		background: token('color.background.selected'),
		borderColor: token('color.border.selected'),
	}),
	borderless: css({
		background: token('color.background.selected'),
	}),
	subtle: css({
		background: 'none',
	}),
};

const droppableAreaOverlayDraggingOverStyles = {
	default: css({
		background: token('color.background.selected.hovered'),
	}),
	borderless: css({
		background: token('color.background.selected.hovered'),
	}),
	subtle: css({
		background: token('color.background.accent.blue.subtlest'),
	}),
};

type DroppableAreaOverlayAppearance = 'default' | 'borderless' | 'subtle';

export type DroppableAreaOverlayProps = {
	isDraggingFrom: boolean;
	isDraggingOver: boolean;

	/**
	 * Variants
	 */
	appearance?: DroppableAreaOverlayAppearance;
};

/**
 * Used to draw the blue background and border for pinned fields with
 * `react-beautiful-dnd`
 */
export function DroppableAreaOverlay({
	isDraggingFrom,
	isDraggingOver,
	appearance = 'default',
}: DroppableAreaOverlayProps) {
	return (
		<div
			css={[
				droppableAreaOverlayStyles,
				isDraggingFrom && droppableAreaOverlayDraggingFromStyles[appearance],
				isDraggingOver && droppableAreaOverlayDraggingOverStyles[appearance],
			]}
		/>
	);
}
