import React, { useCallback, useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import Heading from '@atlaskit/heading';
import { easeInOut } from '@atlaskit/motion/curves';
import { durations } from '@atlaskit/motion/durations';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	dropTargetForElements,
	type ElementDragPayload,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

import { getPeopleFromPosition, getPersonFromPosition, type Person } from '../../data/people';

import { Card } from './card';
import {
	dropHandledExternallyLocalStorageKey,
	getColumnDropTarget,
	getDroppedExternalCardId,
	isCard,
	isCardDropTarget,
	isColumnDropTarget,
	isDraggingExternalCard,
} from './data';

const columnStyles = xcss({
	width: '250px',
	backgroundColor: 'elevation.surface.sunken',
	borderRadius: 'radius.xlarge',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values
	transition: `background ${durations.medium}ms ${easeInOut}`,
	position: 'relative',
});

const scrollContainerStyles = xcss({
	height: '100%',
	overflowY: 'auto',
});

const cardListStyles = xcss({
	boxSizing: 'border-box',
	minHeight: '200px',
	padding: 'space.100',
	gap: 'space.100',
});

const columnHeaderStyles = xcss({
	paddingInlineStart: 'space.200',
	paddingInlineEnd: 'space.200',
	paddingBlockStart: 'space.100',
	color: 'color.text.subtlest',
	userSelect: 'none',
});

type State = { type: 'idle' } | { type: 'is-card-over' };

// preventing re-renders with stable state objects
const idle: State = { type: 'idle' };
const isCardOver: State = { type: 'is-card-over' };

const stateStyles: {
	[key in State['type']]: ReturnType<typeof xcss> | undefined;
} = {
	idle: undefined,
	'is-card-over': xcss({
		backgroundColor: 'color.background.selected.hovered',
	}),
};

/**
 * This function leverages local storage to ensure that columns do not
 * use duplicate people.
 * (unless there are more people used then we have available to use!)
 */
function getPeopleFromSharedPool(): Person[] {
	const localStoragePeopleIndexKey = 'people-index';

	if (typeof window === 'undefined') {
		return [];
	}
	const startIndex: number = (() => {
		const value = Number(localStorage.getItem(localStoragePeopleIndexKey));

		if (Number.isInteger(value)) {
			return value;
		}

		return 0;
	})();

	const amount = 4;
	localStorage.setItem(localStoragePeopleIndexKey, `${startIndex + amount}`);

	return getPeopleFromPosition({ amount, startIndex });
}
export function Column({ columnId }: { columnId: string }) {
	const [items, setItems] = useState<Person[]>(() => getPeopleFromSharedPool());

	const columnRef = useRef<HTMLDivElement | null>(null);
	const headerRef = useRef<HTMLDivElement | null>(null);
	const scrollableRef = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<State>(idle);

	const isHomeColumn = useCallback(({ source }: { source: ElementDragPayload }): boolean => {
		const column = columnRef.current;
		invariant(column);
		return isCard(source.data) && column.contains(source.element);
	}, []);

	// in Safari `document.body.scrollHeight` is not updated
	// by the time a `useLayoutEffect` runs.
	// For simplicity, using a `useEffect` instead.
	useEffect(() => {
		const isInIframe: boolean = typeof window !== 'undefined' && window.parent !== window;

		if (!isInIframe) {
			return;
		}
		const frame = window.frameElement;
		if (!frame) {
			return;
		}

		const updateIframeHeight = () => {
			// Adding a little buffer as there seems to be some
			// sub pixel rounding at various zoom levels.
			// If we don't add the buffer, a scroll bar can appear
			const buffer = 1;
			frame.setAttribute('height', `${document.body.scrollHeight + buffer}`);
		};

		updateIframeHeight();

		const observer = new MutationObserver(() => updateIframeHeight());

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
		});

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const column = columnRef.current;
		const header = headerRef.current;
		const scrollable = scrollableRef.current;
		invariant(column);
		invariant(header);
		invariant(scrollable);

		return combine(
			dropTargetForElements({
				element: column,
				canDrop: isHomeColumn,
				getData: () => getColumnDropTarget({ columnId }),
				getIsSticky: () => true,
				onDragEnter: () => setState(isCardOver),
				onDragLeave: () => setState(idle),
				onDragStart: () => {
					setState(isCardOver);
				},
				onDrop: ({ source, location }) => {
					setState(idle);

					const data = source.data;
					if (!isCard(data)) {
						return;
					}

					const innerMost = location.current.dropTargets[0];
					// this should not happen
					if (!innerMost) {
						return;
					}
					const startIndex = items.findIndex((item) => item.userId === data.cardId);

					const dropTargetData = innerMost.data;

					// dropped on a card: swap as needed
					if (isCardDropTarget(dropTargetData)) {
						const closestEdge = extractClosestEdge(dropTargetData);
						// data setup issue
						invariant(closestEdge);

						const indexOfTarget = items.findIndex((item) => item.userId === dropTargetData.cardId);
						invariant(startIndex !== -1 && indexOfTarget !== -1, 'Could not find items');

						const newItems = reorderWithEdge({
							list: items,
							startIndex,
							indexOfTarget,
							closestEdgeOfTarget: closestEdge,
							axis: 'vertical',
						});

						setItems(newItems);
						return;
					}

					// dropped on the column: move item into last place
					if (isColumnDropTarget(dropTargetData)) {
						const newItems = reorder({
							list: items,
							startIndex,
							finishIndex: items.length - 1,
						});
						setItems(newItems);
						return;
					}
				},
			}),
			dropTargetForExternal({
				element: column,
				getDropEffect: () => 'move',
				canDrop: isDraggingExternalCard,
				getData: () => getColumnDropTarget({ columnId }),
				getIsSticky: () => true,
				onDragEnter: () => setState(isCardOver),
				onDragLeave: () => setState(idle),
				onDrop: ({ source, location }) => {
					setState(idle);

					const cardId = getDroppedExternalCardId({ source });
					if (!cardId) {
						return;
					}

					// Note: could use `zod` or similar to validate shape
					const position = Number(cardId.replace('id:', ''));

					if (!Number.isInteger(position)) {
						// external value was not formed how we expected.
						return;
					}

					const person = getPersonFromPosition({ position });

					const innerMost = location.current.dropTargets[0];
					// this should not happen
					if (!innerMost) {
						return;
					}

					const dropTargetData = innerMost.data;

					function update(people: Person[]) {
						setItems(people);

						// note: no longer using this signal
						// due to timing issue in browsers
						localStorage.setItem(dropHandledExternallyLocalStorageKey, person.userId);
					}

					// dropped on a card: swap as needed
					if (isCardDropTarget(dropTargetData)) {
						const closestEdge = extractClosestEdge(dropTargetData);
						// data setup issue
						invariant(closestEdge);

						const indexOfTarget = items.findIndex((item) => item.userId === dropTargetData.cardId);

						const newIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

						const newItems = Array.from(items);
						newItems.splice(newIndex, 0, person);

						update(newItems);
						return;
					}

					// dropped on the column: move item into last place
					if (isColumnDropTarget(dropTargetData)) {
						const newItems = [...items, person];

						update(newItems);
						return;
					}
				},
			}),
		);
	}, [items, columnId, isHomeColumn]);

	useEffect(() => {
		return monitorForElements({
			canMonitor: isHomeColumn,
			onDrop({ location, source }) {
				// drop handled locally
				if (location.current.dropTargets.length) {
					return;
				}

				/**
				 * Was previously looking at `localStorage` in `onDrop` but this
				 * does not work `Firefox@125.0` and `Safari @17.4.1` due to a
				 * timing bug with drag events.
				 *
				 * - 🍎 https://bugs.webkit.org/show_bug.cgi?id=274069
				 * - 🦊 https://bugzilla.mozilla.org/show_bug.cgi?id=1896323
				 *
				 * Could listen for "storage" events to know when a card is handled
				 * externally. There is a non-trivial amount of code for this as you
				 * also need to handle that the timing differences
				 *  - In Chrome you don't want to remove the dragging item when you
				 *    get the "storage" event, as then you remove the dragging item
				 *    and you no longer get a "dragend" (until our fallback drag end
				 *    logic kicks in).
				 *
				 * For now using the _weak_ signal of `dropEffect` (not public API)
				 * */
				const wasHandledExternally: boolean = (() => {
					const event = window.event;
					if (!(event instanceof DragEvent)) {
						return false;
					}
					return event.dataTransfer?.dropEffect === 'move';
				})();

				if (!wasHandledExternally) {
					return;
				}

				const data = source.data;
				if (!isCard(data)) {
					return;
				}

				setItems((current) => current.filter((item) => item.userId !== data.cardId));
			},
		});
	}, [isHomeColumn]);

	return (
		<Stack ref={columnRef} xcss={[columnStyles, stateStyles[state.type]]}>
			<Inline xcss={columnHeaderStyles} ref={headerRef} spread="space-between" alignBlock="center">
				<Heading size="xxsmall" as="span">
					{columnId}
				</Heading>
			</Inline>
			<Box xcss={scrollContainerStyles} ref={scrollableRef}>
				<Stack xcss={cardListStyles} space="space.100">
					{items.map((item) => (
						<Card item={item} key={item.userId} columnId={columnId} />
					))}
				</Stack>
			</Box>
		</Stack>
	);
}
