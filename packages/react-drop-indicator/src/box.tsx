/**
 * Spacing tokens don't make a lot of sense for this specific use case,
 * so disabling the linting rule.
 */
/* eslint-disable @atlaskit/design-system/ensure-design-token-usage/preview */
/** @jsx jsx */

import type { CSSProperties } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, type SerializedStyles } from '@emotion/react';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

import type { DropIndicatorProps } from './box-without-terminal';
import { line } from './constants';

export type { DropIndicatorProps };

const terminalSize = 8;

const lineStyles = css({
	display: 'block',
	position: 'absolute',
	zIndex: 1,
	// Blocking pointer events to prevent the line from triggering drag events
	// Dragging over the line should count as dragging over the element behind it
	pointerEvents: 'none',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	background: line.backgroundColor,

	// Terminal
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::before': {
		content: '""',
		width: terminalSize,
		height: terminalSize,
		boxSizing: 'border-box',
		position: 'absolute',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		border: `${line.thickness}px solid ${line.backgroundColor}`,
		borderRadius: '50%',
	},
});

/**
 * By default, the edge of the terminal will be aligned to the edge of the line.
 *
 * Offsetting the terminal by half its size aligns the middle of the terminal
 * with the edge of the line.
 *
 * We must offset by half the line width in the opposite direction so that the
 * middle of the terminal aligns with the middle of the line.
 *
 * That is,
 *
 * offset = - (terminalSize / 2) + (line.thickness / 2)
 *
 * which simplifies to the following value.
 */
const offsetToAlignTerminalWithLine = (line.thickness - terminalSize) / 2;

/**
 * We inset the line by half the terminal size,
 * so that the terminal only half sticks out past the item.
 */
const lineOffset = terminalSize / 2;

type Orientation = 'horizontal' | 'vertical';

const orientationStyles: Record<Orientation, SerializedStyles> = {
	horizontal: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		height: line.thickness,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		left: lineOffset,
		right: 0,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// Horizontal indicators have the terminal on the left
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			left: -terminalSize,
		},
	}),
	vertical: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		width: line.thickness,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		top: lineOffset,
		bottom: 0,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// Vertical indicators have the terminal at the top
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			top: -terminalSize,
		},
	}),
};

const edgeToOrientationMap: Record<Edge, Orientation> = {
	top: 'horizontal',
	bottom: 'horizontal',
	left: 'vertical',
	right: 'vertical',
};

const edgeStyles: Record<Edge, SerializedStyles> = {
	top: css({
		top: 'var(--local-line-offset)',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			top: offsetToAlignTerminalWithLine,
		},
	}),
	right: css({
		right: 'var(--local-line-offset)',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			right: offsetToAlignTerminalWithLine,
		},
	}),
	bottom: css({
		bottom: 'var(--local-line-offset)',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			bottom: offsetToAlignTerminalWithLine,
		},
	}),
	left: css({
		left: 'var(--local-line-offset)',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
		'::before': {
			// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
			left: offsetToAlignTerminalWithLine,
		},
	}),
};

/**
 * __Drop indicator__
 *
 * A drop indicator is used to communicate the intended resting place of the draggable item. The orientation of the drop indicator should always match the direction of the content flow.
 */
export function DropIndicator({ edge, gap = '0px' }: DropIndicatorProps) {
	/**
	 * To clearly communicate the resting place of a draggable item during a drag operation,
	 * the drop indicator should be positioned half way between draggable items.
	 */
	const lineOffset = `calc(-0.5 * (${gap} + ${line.thickness}px))`;

	const orientation = edgeToOrientationMap[edge];

	return (
		<div
			css={[lineStyles, orientationStyles[orientation], edgeStyles[edge]]}
			// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
			style={{ '--local-line-offset': lineOffset } as CSSProperties}
		/>
	);
}

// This default export is intended for usage with React.lazy
export default DropIndicator;
