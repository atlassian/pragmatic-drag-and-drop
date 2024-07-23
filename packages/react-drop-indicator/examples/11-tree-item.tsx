/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';

import Layout from './internal/layout';
import TreeItem from './internal/tree-item';

const containerStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
});

const data = {
	currentLevel: 2,
	indentPerLevel: 20,
};

const instructions: Instruction[] = [
	{
		type: 'reorder-above',
		...data,
	},
	{
		type: 'reorder-below',
		...data,
	},
	{
		type: 'make-child',
		...data,
	},
	{
		type: 'reparent',
		...data,
		desiredLevel: 1,
	},
	{
		type: 'reparent',
		...data,
		desiredLevel: 0,
	},
];

const blocked = instructions.map((instruction) => {
	if (instruction.type === 'instruction-blocked') {
		return instruction;
	}
	const updated: Instruction = {
		type: 'instruction-blocked',
		desired: instruction,
	};
	return updated;
});

const all: Instruction[] = [...instructions, ...blocked];

export default function Example() {
	return (
		<Layout testId="layout--appearance">
			<div css={containerStyles}>
				{all.map((instruction, index) => (
					<TreeItem instruction={instruction} key={index} {...data} />
				))}
			</div>
		</Layout>
	);
}
