/* eslint-disable @atlaskit/design-system/no-nested-styles */
/** @jsx jsx */
import { Fragment, type ReactElement, useEffect, useRef, useState } from 'react';

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
	':root': {
		'--grid': '8px',
	},
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

function getItems({ listId, count }: { listId: string; count: number }): ItemType[] {
	return Array.from({ length: count }).map((_, k) => ({
		id: `list[${listId}] index[${k}]`,
	}));
}

const scrollContainerStyles = xcss({
	height: '300px',
	overflowY: 'scroll',
	border: '1px solid green',
});

function List({ listId, children }: { listId: string; children?: ReactElement | ReactElement[] }) {
	const [items] = useState(() => getItems({ listId, count: 20 }));
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		invariant(ref.current);
		return autoScrollForElements({
			element: ref.current,
		});
	}, []);

	return (
		<Box xcss={scrollContainerStyles} padding="space.075" ref={ref}>
			<h4>List: {listId}</h4>
			<Stack space="space.050">
				{items.map((item) => (
					<Item item={item} key={item.id} />
				))}
			</Stack>
			<Fragment>{children}</Fragment>
		</Box>
	);
}

export default function WindowScroll() {
	useEffect(() => {
		return autoScrollWindowForElements({});
	});
	return (
		<Fragment>
			<Global styles={globalStyles} />
			<List listId="1">
				<List listId="1.1" />
				<List listId="1.2">
					<List listId="1.2.1" />
					<List listId="1.2.2" />
				</List>
				<List listId="1.3" />
			</List>
		</Fragment>
	);
}
