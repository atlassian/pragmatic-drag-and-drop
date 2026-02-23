/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import React from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const styles = css({
	borderRadius: token('radius.small'),
	border: token('color.border'),
	borderStyle: 'solid',
	borderWidth: token('border.width'),
});

export function TrelloLikeBoardIframe(): React.JSX.Element {
	return (
		<iframe
			title="Board with Trello like affordances"
			src="https://pragmatic-board.vercel.app/two-columns?utm_source=atlassian+design&utm_medium=embed&utm_campaign=pdnd+example+page"
			width="100%"
			height="800px"
			loading="lazy"
			frameBorder={0}
			css={styles}
		/>
	);
}
