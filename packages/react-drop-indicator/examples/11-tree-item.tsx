/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import React from 'react';

import { css, jsx } from '@compiled/react';

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

export default function Example({ direction = 'ltr' }: { direction: 'ltr' | 'rtl' }) {
	return (
		<React.StrictMode>
			<div dir={direction}>
				<Layout testId="layout--appearance">
					<div css={containerStyles}>
						{all.map((instruction, index) => (
							<TreeItem instruction={instruction} key={index} {...data} />
						))}
					</div>
				</Layout>
			</div>
		</React.StrictMode>
	);
}

// For VR testing
export function RTLTree() {
	return <Example direction="rtl" />;
}
