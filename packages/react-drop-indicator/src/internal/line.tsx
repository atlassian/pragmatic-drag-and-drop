/* eslint-disable @atlaskit/ui-styling-standard/enforce-style-prop */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { CSSProperties } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled
import { css, jsx, type SerializedStyles } from '@emotion/react';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

import type { CSSSize, StrokeColor, StrokeWidth } from '../internal-types';
import { presetStrokeColors, presetStrokeSizes } from '../presets';

type Orientation = 'horizontal' | 'vertical';

const edgeToOrientationMap: Record<Edge, Orientation> = {
	top: 'horizontal',
	bottom: 'horizontal',
	left: 'vertical',
	right: 'vertical',
};

const baseStyles = css({
	display: 'block',
	position: 'absolute',
	zIndex: 1,
	// Blocking pointer events to prevent the line from triggering drag events
	pointerEvents: 'none',
	backgroundColor: 'var(--stroke-color)',

	// &::before is for the terminal
	'&::before': {
		display: 'var(--terminal-display)',
		content: '""',
		position: 'absolute',
		boxSizing: 'border-box',
		width: 'var(--terminal-diameter)',
		height: 'var(--terminal-diameter)',
		borderWidth: 'var(--stroke-width)',
		borderStyle: 'solid',
		borderColor: 'var(--stroke-color)',
		borderRadius: '50%',
	},
});

const orientationStyles: Record<Orientation, SerializedStyles> = {
	horizontal: css({
		height: 'var(--stroke-width)',
		insetInlineStart: 'var(--line-main-axis-start)',
		insetInlineEnd: 0,
		'&::before': {
			insetInlineStart: 'var(--terminal-main-axis-start)',
		},
	}),
	// For now, vertical lines will always have the terminal on the top.
	// Need to investigate whether we want the terminal on the bottom
	// for bottom to top languages.
	vertical: css({
		width: 'var(--stroke-width)',
		top: 'var(--line-main-axis-start)',
		bottom: 0,
		'&::before': {
			top: 'var(--terminal-main-axis-start)',
		},
	}),
};

const edgeStyles: Record<Edge, SerializedStyles> = {
	top: css({
		top: 'var(--main-axis-offset)',
		'&::before': {
			top: 'var(--terminal-cross-axis-offset)',
		},
	}),
	right: css({
		right: 'var(--main-axis-offset)',
		'&::before': {
			right: 'var(--terminal-cross-axis-offset)',
		},
	}),
	bottom: css({
		bottom: 'var(--main-axis-offset)',
		'&::before': {
			bottom: 'var(--terminal-cross-axis-offset)',
		},
	}),
	left: css({
		left: 'var(--main-axis-offset)',
		'&::before': {
			left: 'var(--terminal-cross-axis-offset)',
		},
	}),
};

type Appearance = 'terminal' | 'no-terminal' | 'terminal-no-bleed';

const lineStartFrom: { [TKey in Appearance]: ({ indent }: { indent: string }) => string } = {
	// - half the terminal bleeding out the containing element
	// - half the terminal inside the containing element (we need to position the line next to this)
	terminal: ({ indent }) => `calc(var(--terminal-radius) + ${indent})`,

	// The full terminal is inside the containing element (we need to position the line next to this)
	'terminal-no-bleed': ({ indent }) => `calc(var(--terminal-diameter) + ${indent})`,

	// No terminal to worry about, line should take up all the space
	'no-terminal': ({ indent }) => indent,
};

export function Line({
	edge,
	gap = '0px',
	indent = '0px',
	strokeColor = 'standard',
	strokeWidth = 'standard',
	appearance = 'terminal',
}: {
	edge: Edge;
	indent?: CSSSize;
	gap?: CSSSize;
	strokeColor?: StrokeColor;
	strokeWidth?: StrokeWidth;
	appearance?: 'terminal' | 'no-terminal' | 'terminal-no-bleed';
}) {
	const orientation = edgeToOrientationMap[edge];

	return (
		<div
			style={
				{
					// ## All

					'--stroke-color': presetStrokeColors[strokeColor] ?? strokeColor,
					'--stroke-width': presetStrokeSizes[strokeWidth] ?? strokeWidth,

					// Shift line and terminal on the main access to account for gaps between items
					'--main-axis-offset': `calc(-0.5 * (${gap} + var(--stroke-width)))`,

					// ## Line

					// If there is a terminal, we want the line to start from next to it
					'--line-main-axis-start': lineStartFrom[appearance]({ indent }),

					// ## Terminal

					'--terminal-display': appearance === 'no-terminal' ? 'none' : 'block',
					'--terminal-diameter': 'calc(var(--stroke-width) * 4)',
					'--terminal-radius': 'calc(var(--terminal-diameter) / 2)',

					// The line is positioned to account for the the terminal (--line-main-axis-start).
					// The terminal is rendered relative to the line (it's a `::before`)
					// We need to pull the terminal backwards so it sits before the start of the line
					'--terminal-main-axis-start': 'calc(-1 * var(--terminal-diameter))',

					// Pull the terminal backwards on the cross axis (eg "up" on "vertical")
					// so the center of the terminal lines up with the center of the line
					'--terminal-cross-axis-offset':
						'calc(calc(var(--stroke-width) - var(--terminal-diameter)) / 2)',
				} as CSSProperties
			}
			css={[baseStyles, orientationStyles[orientation], edgeStyles[edge]]}
		/>
	);
}

// For React.lazy
export default Line;
