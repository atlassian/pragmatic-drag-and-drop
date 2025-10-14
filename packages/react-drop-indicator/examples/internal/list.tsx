/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { type CSSProperties, type ReactNode, useState } from 'react';

import { css, cssMap, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

const innerStyles = css({
	paddingTop: token('space.100'),
	paddingRight: token('space.100'),
	paddingBottom: token('space.100'),
	paddingLeft: token('space.100'),
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: token('color.border'),
});

const outerStyles = css({
	position: 'relative',
	flexGrow: '1', // so our inline items grow to fill the width
});

function Item({ item, indicator }: { item: TItem; indicator?: ReactNode }) {
	return (
		<div css={outerStyles}>
			<div css={innerStyles}>{item.id}</div>
			{indicator}
		</div>
	);
}

type TItem = {
	id: string;
};

function getItems({ amount }: { amount: number }): TItem[] {
	return Array.from({ length: amount }, (_, index) => ({ id: `id:${index}` }));
}

const listStyles = css({
	display: 'flex',
	gap: 'var(--gap)',
	width: '300px',
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: token('color.border'),
	paddingTop: token('space.100'),
	paddingRight: token('space.100'),
	paddingBottom: token('space.100'),
	paddingLeft: token('space.100'),
	boxSizing: 'border-box',
});

const orientationStyles = cssMap({
	horizontal: { flexDirection: 'row' },
	vertical: { flexDirection: 'column' },
});

export type Orientation = 'vertical' | 'horizontal';

export function List({
	amount = 4,
	gap = token('space.0'),
	orientation = 'vertical',
	indicator,
}: {
	amount?: number;
	orientation?: Orientation;
	gap?: string;
	indicator?: ReactNode;
}) {
	const [items] = useState<TItem[]>(() => getItems({ amount }));
	return (
		<div
			style={
				{
					'--gap': gap,
				} as CSSProperties
			}
			css={[listStyles, orientationStyles[orientation]]}
		>
			{items.map((item) => (
				<Item item={item} key={item.id} indicator={indicator} />
			))}
		</div>
	);
}
