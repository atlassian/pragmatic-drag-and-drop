/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactElement, ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

import { DropIndicator as defaultDropIndicator, type DropIndicatorProps } from '../../src/box';

type CardProps = {
	children: ReactNode;
	DropIndicator?: (props: DropIndicatorProps) => ReactElement | null;
} & Pick<DropIndicatorProps, 'edge' | 'gap'>;

const cardStyles = css({
	display: 'grid',
	minWidth: 120,
	padding: '16px 20px',
	backgroundColor: token('elevation.surface.raised'),
	borderRadius: 3,
	boxShadow: token(
		'elevation.shadow.raised',
		'rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.31) 0px 0px 1px',
	),
	placeItems: 'center',
	position: 'relative',
});

const Card = ({ children, edge, gap, DropIndicator = defaultDropIndicator }: CardProps) => {
	return (
		<div css={cardStyles} data-testid="card">
			<strong>{children}</strong>
			<DropIndicator edge={edge} gap={gap} />
		</div>
	);
};

export default Card;
