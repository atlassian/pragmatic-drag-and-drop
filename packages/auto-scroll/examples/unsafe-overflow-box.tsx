import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { unsafeOverflowAutoScrollForElements } from '../src/entry-point/unsafe-overflow/element';

function getHugeContent(): string {
	return Array.from({ length: 10000 }, (_, index) => `index:${index}`).join(' ');
}

const scrollContainerStyles = xcss({
	overflowX: 'scroll',
	overflowY: 'scroll',
	width: '400px',
	height: '400px',
	borderWidth: token('border.width'),
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.200',
	gap: 'space.200',
});
const containerStyles = xcss({
	height: '100vh',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
});
const draggableStyles = xcss({
	padding: 'space.100',
	backgroundColor: 'color.background.accent.blue.subtle',
});

const contentStyles = xcss({
	width: '1000px',
});

export default function Example(): React.JSX.Element {
	const [content] = useState(() => getHugeContent());
	const scrollableRef = useRef<HTMLDivElement | null>(null);
	const draggableRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const scrollableEl = scrollableRef.current;
		invariant(scrollableEl);

		scrollableEl.scrollTop = scrollableEl.scrollHeight / 2;
		scrollableEl.scrollLeft = scrollableEl.scrollWidth / 2;
	}, []);

	useEffect(() => {
		const scrollableEl = scrollableRef.current;
		const draggableEl = draggableRef.current;
		invariant(scrollableEl && draggableEl);
		return combine(
			draggable({
				element: draggableEl,
			}),
			unsafeOverflowAutoScrollForElements({
				element: scrollableEl,
				getOverflow() {
					return {
						forTopEdge: {
							top: 100,
							left: 100,
							right: 100,
						},
					};
				},
			}),
		);
	}, []);

	return (
		<Box xcss={containerStyles}>
			<Box xcss={scrollContainerStyles} ref={scrollableRef}>
				<Box xcss={contentStyles}>{content}</Box>
			</Box>
			<Box xcss={draggableStyles} ref={draggableRef}>
				Drag me
			</Box>
		</Box>
	);
}
