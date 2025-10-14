/* eslint-disable @atlaskit/design-system/use-primitives */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import type { ReactNode } from 'react';

import { css, jsx } from '@compiled/react';

import { GroupDropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/group';
import { token } from '@atlaskit/tokens';

const itemStyles = css({
	paddingTop: token('space.100'),
	paddingRight: token('space.100'),
	paddingBottom: token('space.100'),
	paddingLeft: token('space.100'),
});

function Item({ content }: { content: ReactNode }) {
	return <div css={itemStyles}>{content}</div>;
}

const styles = css({
	paddingTop: token('space.100'),
	paddingRight: token('space.100'),
	paddingBottom: token('space.100'),
	paddingLeft: token('space.100'),
});

export function GroupExample() {
	return (
		<GroupDropIndicator isActive>
			<div css={styles}>
				<Item content="item A" />
				<Item content="item B" />
				<Item content="item C" />
				<Item content="item C" />
			</div>
		</GroupDropIndicator>
	);
}
