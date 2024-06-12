/** @jsx jsx */

import { type CSSProperties, type ReactElement } from 'react';

import { css, jsx } from '@emotion/react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { token } from '@atlaskit/tokens';

import { line } from './constants';

const lineStyles = css({
	'--terminal-size': '8px',
	// To make things a bit clearer we are making the box that the indicator in as
	// big as the whole tree item
	position: 'absolute',
	top: 0,
	right: 0,
	left: 'var(--horizontal-indent)',
	bottom: 0,

	// We don't want to cause any additional 'dragenter' events
	pointerEvents: 'none',

	// Terminal
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::before': {
		display: 'block',
		content: '""',
		position: 'absolute',
		zIndex: 2,

		boxSizing: 'border-box',
		width: 'var(--terminal-size)',
		height: 'var(--terminal-size)',
		left: 0,
		background: 'transparent',
		borderColor: 'var(--indicator-color)',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		borderWidth: line.thickness,
		borderRadius: '50%',
		borderStyle: 'solid',
	},

	// Line
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::after': {
		display: 'block',
		content: '""',
		position: 'absolute',
		zIndex: 1,
		background: 'var(--indicator-color)',
		left: 'calc(var(--terminal-size) / 2)', // putting the line to the right of the terminal
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		height: line.thickness,
		right: 0,
	},
});

const lineAboveStyles = css({
	// terminal
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::before': {
		top: 0,
		// move to position to be a 'cap' on the line
		transform: `translate(calc(-0.5 * var(--terminal-size)), calc(-0.5 * var(--terminal-size)))`,
	},
	// line
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::after': {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		top: `${-0.5 * line.thickness}px`,
	},
});

const lineBelowStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::before': {
		bottom: 0,
		// move to position to be a 'cap' on the line
		transform: `translate(calc(-0.5 * var(--terminal-size)), calc(0.5 * var(--terminal-size)))`,
	},
	// line
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	'::after': {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		bottom: `${-0.5 * line.thickness}px`,
	},
});

const outlineStyles = css({
	// To make things a bit clearer we are making the box that the indicator in as
	// big as the whole tree item
	position: 'absolute',
	top: 0,
	right: 0,
	left: 'var(--horizontal-indent)',
	bottom: 0,

	// We don't want to cause any additional 'dragenter' events
	pointerEvents: 'none',

	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	border: `${line.thickness}px solid var(--indicator-color)`,
	// TODO: make this a prop?
	// For now: matching the Confluence tree item border radius
	borderRadius: '3px',
});

export type DropIndicatorProps = {
	instruction: Instruction;
};

function getElement({
	instruction,
	isBlocked,
}: {
	instruction: Exclude<Instruction, { type: 'instruction-blocked' }>;
	isBlocked: boolean;
}): ReactElement | null {
	const style = {
		'--horizontal-indent': `${instruction.currentLevel * instruction.indentPerLevel}px`,
		'--indicator-color': !isBlocked ? line.backgroundColor : token('color.border.warning'),
	} as CSSProperties;

	if (instruction.type === 'reorder-above') {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
		return <div css={[lineStyles, lineAboveStyles]} style={style} />;
	}
	if (instruction.type === 'reorder-below') {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
		return <div css={[lineStyles, lineBelowStyles]} style={style} />;
	}

	if (instruction.type === 'make-child') {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
		return <div css={[outlineStyles]} style={style} />;
	}

	if (instruction.type === 'reparent') {
		(style as any)['--horizontal-indent'] = `${
			instruction.desiredLevel * instruction.indentPerLevel
		}px`;

		// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
		return <div css={[lineStyles, lineBelowStyles]} style={style} />;
	}
	return null;
}

export function DropIndicator({ instruction }: DropIndicatorProps) {
	if (instruction.type === 'instruction-blocked') {
		return getElement({ instruction: instruction.desired, isBlocked: true });
	}
	return getElement({ instruction, isBlocked: false });
}
