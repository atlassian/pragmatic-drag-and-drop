import React, { type ReactNode, useEffect, useRef } from 'react';

import invariant from 'tiny-invariant';

import { cssMap } from '@atlaskit/css';
import { Box } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import { dropTargetForElements } from '../../src/entry-point/element/adapter';

const styles = cssMap({
	// `<Box>` (compiled) is used so that `tabIndex={0}` is allowed under the
	// ratcheted `@atlassian/a11y/no-noninteractive-tabindex` rule, which is
	// required to satisfy axe `scrollable-region-focusable`. The visual layout
	// (column of cards, fixed shrunk height to force scrolling) matches the
	// emotion equivalent in the consumer file.
	container: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		// Intentionally too small to fit all of the cards, so we can test the
		// `scrollJustEnoughIntoView` behaviour.
		height: '72px',
		gap: token('space.100'),
		overflow: 'auto',
		width: '240px',
		marginInlineStart: 'auto',
		marginInlineEnd: 'auto',
		paddingTop: token('space.100'),
		paddingBottom: token('space.100'),
		paddingLeft: token('space.100'),
		paddingRight: token('space.100'),
	},
});

type TScrollableDropTargetProps = {
	children: ReactNode;
	testId: string;
};

export function ScrollableDropTarget({
	children,
	testId,
}: TScrollableDropTargetProps): React.JSX.Element {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return dropTargetForElements({ element });
	}, []);

	// `tabIndex={0}` + `role="region"` + `aria-label` make the scrollable
	// region keyboard-reachable and labelled (axe `scrollable-region-focusable`).
	return (
		<Box
			ref={ref}
			xcss={styles.container}
			testId={testId}
			tabIndex={0}
			role="region"
			aria-label="Cards"
		>
			{children}
		</Box>
	);
}
