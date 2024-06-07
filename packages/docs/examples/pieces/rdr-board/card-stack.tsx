/** @jsx jsx */

import type { ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import Badge from '@atlaskit/badge';
import { token } from '@atlaskit/tokens';

const sharedCardStyles = css({
	background: token('elevation.surface.raised', '#FFF'),
	borderRadius: 3,
});

const secondCardStyles = css({
	position: 'absolute',
	width: 'calc(100% - 16px)',
	height: '100%',
	bottom: -5,

	left: 8,

	// boxShadow: `${token('elevation.shadow.overlay')}, ${token(
	//   'elevation.shadow.raised',
	// )}`,

	boxShadow: token('elevation.shadow.raised', '0px 1px 1px #091e423f, 0px 0px 1px #091e4221'),
});

const secondCardInnerStyles = css({
	width: '100%',
	height: '100%',
	background: 'rgba(0, 0, 0, 0.1)',
});

const bottomCardStyles = css({
	position: 'absolute',
	width: 'calc(100% - 32px)',
	height: '100%',
	bottom: -9,
	background: 'rgba(0, 0, 0, 0.2)',
	left: 16,
	filter: 'blur(1.5px)',
});

const containerStyles = css({
	// width: 368,
	// height: 112,
	position: 'relative',
});

export function CardStack({ children, numCards }: { children: ReactNode; numCards: number }) {
	return (
		<div css={containerStyles}>
			{numCards >= 3 && <div css={[sharedCardStyles, bottomCardStyles]} />}

			{numCards >= 2 && (
				<div css={[sharedCardStyles, secondCardStyles]}>
					<div css={secondCardInnerStyles} />
				</div>
			)}

			{children}

			{numCards >= 2 && (
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				<div style={{ position: 'absolute', top: -8, right: -8 }}>
					<Badge appearance="primary">{numCards}</Badge>
				</div>
			)}
		</div>
	);
}
