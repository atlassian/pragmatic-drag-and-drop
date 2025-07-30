import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { combine } from '../src/entry-point/combine';
import { draggable } from '../src/entry-point/element/adapter';
import { dropTargetForExternal } from '../src/entry-point/external/adapter';
import { containsText, getText } from '../src/entry-point/external/text';

const appStyles = xcss({
	userSelect: 'none',
});

const draggableStyles = xcss({
	backgroundColor: 'color.background.accent.blue.subtle',
	padding: 'space.075',
});

const dropTargetStyles = xcss({
	backgroundColor: 'color.background.accent.green.subtlest',
	minHeight: 'size.1000',
	padding: 'space.075',
});

const iframeStyles = xcss({
	width: '600px',
	height: '600px',
	borderWidth: 'border.width.outline',
	borderColor: 'color.border',
	borderStyle: 'solid',
});

const isInIframeStyles = xcss({
	backgroundColor: 'color.background.accent.blue.subtlest',
});

export default function IframeOuter() {
	const draggableRef = useRef<HTMLDivElement | null>(null);
	const dropTargetRef = useRef<HTMLDivElement | null>(null);
	const [dragCount, setDragCount] = useState<number>(0);
	const [latestDropData, setLatestDropData] = useState<string>('none');

	const [isInIframe] = useState<boolean>(() => {
		if (typeof window === undefined) {
			return false;
		}
		return window.parent !== window;
	});

	useEffect(() => {
		const draggableEl = draggableRef.current;
		const dropTargetEl = dropTargetRef.current;
		invariant(draggableEl && dropTargetEl);
		return combine(
			draggable({
				element: draggableEl,
				getInitialDataForExternal: () => {
					const data: string = (() => {
						if (isInIframe) {
							return `Drag from iframe: ${dragCount}`;
						}
						return `Drag from parent: ${dragCount}`;
					})();

					return {
						'text/plain': data,
					};
				},
				onDrop() {
					setDragCount((current) => current + 1);
				},
			}),
			dropTargetForExternal({
				element: dropTargetEl,
				canDrop: containsText,
				onDragLeave() {},
				onDrop({ source }) {
					setLatestDropData(getText({ source }) ?? '');
				},
			}),
		);
	}, [isInIframe, dragCount]);

	return (
		<Stack xcss={[appStyles, isInIframe ? isInIframeStyles : undefined]} space="space.100">
			<h3>{isInIframe ? 'Child iframe' : 'Parent window'}</h3>
			<Box
				ref={draggableRef}
				xcss={draggableStyles}
				draggable="true"
				testId={`draggable-in-${isInIframe ? 'iframe' : 'parent'}`}
			>
				Drag me (I attach native data)
			</Box>
			<Stack
				ref={dropTargetRef}
				xcss={dropTargetStyles}
				testId={`drop-target-in-${isInIframe ? 'iframe' : 'parent'}`}
				space="space.100"
			>
				<Box as="h4">Drop target</Box>
				<Box>Latest drop data: {latestDropData}</Box>
			</Stack>
			{!isInIframe ? (
				<Box as="iframe" title={'child iframe'} xcss={iframeStyles} src={window.location.href} testId={'child-iframe'} />
			) : null}
		</Stack>
	);
}
