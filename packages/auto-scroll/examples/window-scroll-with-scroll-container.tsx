/* eslint-disable @atlaskit/design-system/no-nested-styles */
/** @jsx jsx */
import { Fragment, useEffect, useRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/no-global-styles, @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, Global, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { autoScrollForElements, autoScrollWindowForElements } from '../src/entry-point/element';

const globalStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':root': {
		'--grid': '8px',
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-nested-selectors -- Ignored via go/DSP-18766
	body: {
		height: '150vh',
	},
});

type ItemType = {
	id: string;
};

const itemStyles = xcss({
	padding: 'space.050',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border.brand',
	borderRadius: 'border.radius',
	backgroundColor: 'color.background.accent.lime.subtlest',
	width: '300px',
});

function Item({ item }: { item: ItemType }) {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);
		return combine(
			draggable({
				element,
				getInitialData: () => item,
			}),
			dropTargetForElements({ element, getIsSticky: () => true }),
		);
	}, [item]);
	return (
		<Box xcss={itemStyles} ref={ref}>
			{item.id}
		</Box>
	);
}

const items: ItemType[] = Array.from({ length: 200 }).map((_, i) => ({
	id: `id:${i}`,
}));

const scrollContainerStyles = xcss({
	height: '100vh',
	overflowY: 'scroll',
});

const rootStyles = xcss({
	backgroundColor: 'color.background.accent.blue.subtle',
	height: '200vh',
	width: '200vw',
});

export default function WindowScroll() {
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		invariant(scrollContainer);
		return combine(
			autoScrollWindowForElements(),
			autoScrollForElements({
				element: scrollContainer,
			}),
		);
	});
	return (
		<Fragment>
			<Global styles={globalStyles} />
			<Box xcss={rootStyles}>
				<Box ref={scrollContainerRef} xcss={scrollContainerStyles}>
					<Stack space="space.050">
						{items.map((item) => (
							<Item item={item} key={item.id} />
						))}
					</Stack>
				</Box>
			</Box>
		</Fragment>
	);
}
