import { useCallback, useEffect, useState } from 'react';

import invariant from 'tiny-invariant';

import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

type UseToplevelWiringArgs<DataItem> = {
	initialData: DataItem[];
	type: string;

	shouldPreventUnhandled?: boolean;
};

export type ReorderItem = (args: { id: string; action: 'up' | 'down' }) => void;

function dispatchAfterDropEvent(detail: { id: string; type: string }) {
	requestAnimationFrame(() => {
		/**
		 * Dispatching an event for simplicity. In a real app we might not
		 * want to do it this way.
		 */
		window.dispatchEvent(new CustomEvent('afterdrop', { detail }));
	});
}

/**
 * This hook combines a couple of things which makes it hard to give it a
 * more descriptive name:
 *
 * - Initializes the data
 * - Monitors drops to reorder the data on drops
 * - Cancels unhandled drops
 */
export function useTopLevelWiring<DataItem extends { id: string }>({
	initialData,
	type,
	shouldPreventUnhandled = true,
}: UseToplevelWiringArgs<DataItem>): {
	data: DataItem[];
	reorderItem: ReorderItem;
} {
	const [data, setData] = useState(initialData);

	useEffect(() => {
		return monitorForElements({
			onDragStart: ({ source }) => {
				if (source.data.type !== type) {
					return;
				}

				if (shouldPreventUnhandled) {
					preventUnhandled.start();
				}
			},
			onDrop: ({ location, source }) => {
				if (source.data.type !== type) {
					return;
				}

				if (shouldPreventUnhandled) {
					preventUnhandled.stop();
				}

				const destination = location.current.dropTargets[0];
				if (!destination) {
					return;
				}

				if (destination.data.type !== source.data.type) {
					return;
				}

				const startIndex = source.data.index;
				invariant(typeof startIndex === 'number');

				const indexOfTarget = destination.data.index;
				invariant(typeof indexOfTarget === 'number');

				setData((data) =>
					reorderWithEdge({
						list: data,
						closestEdgeOfTarget: extractClosestEdge(destination.data),
						startIndex,
						indexOfTarget,
						axis: 'vertical',
					}),
				);

				dispatchAfterDropEvent({ id: source.data.id as string, type });
			},
		});
	}, [shouldPreventUnhandled, type]);

	const reorderItem: ReorderItem = useCallback(
		({ id, action }) => {
			setData((data) => {
				const index = data.findIndex((item) => item.id === id);
				return reorder({
					list: data,
					startIndex: index,
					finishIndex: action === 'up' ? index - 1 : index + 1,
				});
			});
			dispatchAfterDropEvent({ id, type });
		},
		[type],
	);

	return { data, reorderItem };
}
