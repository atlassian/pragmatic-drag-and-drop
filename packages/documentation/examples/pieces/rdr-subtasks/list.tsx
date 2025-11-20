import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import {
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Stack, xcss } from '@atlaskit/primitives';

import { ListContext } from './context';
import { defaultItems, type ItemData } from './data';
import { ListItem } from './list-item';

const containerStyles = xcss({
	// borderWidth: 'border.width',
	// borderStyle: 'solid',
	// borderColor: 'color.border',
	borderRadius: 'radius.small',
	boxShadow: 'elevation.shadow.raised',
});

type ListState = {
	items: ItemData[];
	lastCardMoved: {
		item: ItemData;
		previousIndex: number;
		currentIndex: number;
		numberOfItems: number;
	} | null;
};

export default function ListExample(): React.JSX.Element {
	const [{ items, lastCardMoved }, setListState] = useState<ListState>({
		items: defaultItems,
		lastCardMoved: null,
	});

	const registryRef = useRef(new Map<string, HTMLElement>());
	const registerItem = useCallback(({ id, element }: { id: string; element: HTMLElement }) => {
		const registry = registryRef.current;
		if (!registry) {
			return () => {};
		}
		registry.set(id, element);

		return function unregisterItem() {
			registry.delete(id);
		};
	}, []);

	useEffect(() => {
		return () => {
			liveRegion.cleanup();
		};
	}, []);

	/**
	 * Creating a stable reference for the items, so that we can avoid
	 * rerenders.
	 */
	const stableItemsRef = useRef<ItemData[]>(items);
	useEffect(() => {
		stableItemsRef.current = items;
	}, [items]);

	useEffect(() => {
		if (lastCardMoved === null) {
			return;
		}

		const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved;
		const element = registryRef.current.get(item.id);
		if (element) {
			triggerPostMoveFlash(element);
		}

		liveRegion.announce(
			`You've moved ${item.label} from position ${
				previousIndex + 1
			} to position ${currentIndex + 1} of ${numberOfItems}.`,
		);
	}, [lastCardMoved]);

	const reorderItem = useCallback(
		({
			startIndex,
			indexOfTarget,
			closestEdgeOfTarget,
		}: {
			startIndex: number;
			indexOfTarget: number;
			closestEdgeOfTarget: Edge | null;
		}) => {
			const finishIndex = getReorderDestinationIndex({
				startIndex,
				closestEdgeOfTarget,
				indexOfTarget,
				axis: 'vertical',
			});

			if (finishIndex === startIndex) {
				// If there would be no change, we skip the update
				return;
			}

			setListState((listState) => {
				const item = listState.items[startIndex];

				return {
					items: reorder({
						list: listState.items,
						startIndex,
						finishIndex,
					}),
					lastCardMoved: {
						item,
						previousIndex: startIndex,
						currentIndex: finishIndex,
						numberOfItems: listState.items.length,
					},
				};
			});
		},
		[],
	);

	useEffect(() => {
		return monitorForElements({
			canMonitor({ source }) {
				return source.data.instance === 'subtasks';
			},
			onDrop({ location, source }) {
				const target = location.current.dropTargets[0];
				if (!target) {
					return;
				}

				const items = stableItemsRef.current;

				const startIndex = items.findIndex((item) => item.id === source.data.id);
				if (startIndex < 0) {
					return;
				}

				const indexOfTarget = items.findIndex((item) => item.id === target.data.id);
				if (indexOfTarget < 0) {
					return;
				}

				const closestEdgeOfTarget = extractClosestEdge(target.data);

				reorderItem({ startIndex, indexOfTarget, closestEdgeOfTarget });
			},
		});
	}, [reorderItem]);

	const getItemPosition = useCallback((itemData: ItemData) => {
		const items = stableItemsRef.current;

		if (items.length === 1) {
			return 'only';
		}

		const index = items.indexOf(itemData);
		if (index === 0) {
			return 'first';
		}

		if (index === items.length - 1) {
			return 'last';
		}

		return 'middle';
	}, []);

	const getItemIndex = useCallback(({ id }: { id: string }) => {
		return stableItemsRef.current.findIndex((item) => item.id === id);
	}, []);

	const contextValue = useMemo(() => {
		return { getItemIndex, getItemPosition, registerItem, reorderItem };
	}, [getItemIndex, getItemPosition, registerItem, reorderItem]);

	return (
		<ListContext.Provider value={contextValue}>
			<Stack xcss={containerStyles}>
				{items.map((itemData) => (
					<ListItem key={itemData.id} itemData={itemData} />
				))}
			</Stack>
		</ListContext.Provider>
	);
}
