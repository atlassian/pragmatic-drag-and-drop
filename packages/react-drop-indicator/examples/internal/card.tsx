/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { JSX, ReactElement, ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

import {
	DropIndicator as defaultDropIndicator,
	type DropIndicatorProps,
} from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { token } from '@atlaskit/tokens';

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
	boxShadow: token('elevation.shadow.raised'),
	placeItems: 'center',
	position: 'relative',
});

const Card = ({
	children,
	edge,
	gap,
	DropIndicator = defaultDropIndicator,
}: CardProps): JSX.Element => {
	return (
		<div css={cardStyles} data-testid="card">
			<strong>{children}</strong>
			<DropIndicator edge={edge} gap={gap} />
		</div>
	);
};

export default Card;
