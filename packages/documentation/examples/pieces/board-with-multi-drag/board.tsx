import React, { memo, type ReactNode, useEffect, useRef } from 'react';

import invariant from 'tiny-invariant';

import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Flex, xcss } from '@atlaskit/primitives';

import { GlobalStyles } from '../../util/global-styles';

const boardStyles = xcss({
	margin: '0 auto',
	gap: 'space.200',
	flexDirection: 'row',
	height: '100%',
	boxSizing: 'border-box',
});

const scrollContainerStyles = xcss({
	overflowY: 'auto',
	height: '600px',
});

function Board({ children }: { children: ReactNode }): React.JSX.Element {
	const ref = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		invariant(ref.current);
		return autoScrollForElements({
			element: ref.current,
		});
	}, []);
	return (
		<>
			<Box ref={ref} xcss={scrollContainerStyles}>
				<Flex xcss={boardStyles}>{children}</Flex>
			</Box>
			<GlobalStyles />
		</>
	);
}

export default memo(Board);
