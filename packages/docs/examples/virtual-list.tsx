import React, {
	createContext,
	Fragment,
	memo,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Lozenge from '@atlaskit/lozenge';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	type ElementDragPayload,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { Box, Grid, Inline, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

type ItemPosition = 'first' | 'last' | 'middle' | 'only';

type CleanupFn = () => void;

type ItemEntry = { itemId: string; element: HTMLElement };

type ListContextValue = {
	getListLength: () => number;
	registerItem: (entry: ItemEntry) => CleanupFn;
	reorderItem: (args: {
		startIndex: number;
		indexOfTarget: number;
		closestEdgeOfTarget: Edge | null;
	}) => void;
	instanceId: symbol;
};

const ListContext = createContext<ListContextValue | null>(null);

function useListContext() {
	const listContext = useContext(ListContext);
	invariant(listContext !== null);
	return listContext;
}

type Item = {
	id: string;
	label: string;
};

const itemKey = Symbol('item');
type ItemData = {
	[itemKey]: true;
	item: Item;
	index: number;
	instanceId: symbol;
};

function getItemData({
	item,
	index,
	instanceId,
}: {
	item: Item;
	index: number;
	instanceId: symbol;
}): ItemData {
	return {
		[itemKey]: true,
		item,
		index,
		instanceId,
	};
}

function isItemData(data: Record<string | symbol, unknown>): data is ItemData {
	return data[itemKey] === true;
}

function getItemPosition({ index, items }: { index: number; items: Item[] }): ItemPosition {
	if (items.length === 1) {
		return 'only';
	}

	if (index === 0) {
		return 'first';
	}

	if (index === items.length - 1) {
		return 'last';
	}

	return 'middle';
}

const sizes = {
	item: {
		outer: 46,
		inner: 40,
	},
};

const itemOuterStyles = xcss({
	boxSizing: 'border-box',
	padding: 'space.050',
	backgroundColor: 'elevation.surface',
	display: 'flex',
	flexDirection: 'column',
});

const listItemInnerStyles = xcss({
	width: '100%',
	flexShrink: '0', // locking the size
	height: `${sizes.item.inner}px`,
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'row',
	alignContent: 'center',
	padding: 'space.050',
	position: 'relative', // for drop indicator placement

	borderWidth: 'border.width',
	borderColor: 'color.border',
	borderStyle: 'solid',
});

const listItemDisabledStyles = xcss({ opacity: 0.4 });

type ItemState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement }
	| { type: 'dragging' }
	| { type: 'is-over'; closestEdge: Edge | null };

const idleState: ItemState = { type: 'idle' };
const draggingState: ItemState = { type: 'dragging' };

const listItemPreviewStyles = xcss({
	paddingBlock: 'space.050',
	paddingInline: 'space.100',
	borderRadius: 'border.radius.100',
	backgroundColor: 'elevation.surface.overlay',
	maxWidth: '360px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
});

const itemLabelStyles = xcss({
	flexGrow: 1,
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
});

function DropDownContent({ position, index }: { position: ItemPosition; index: number }) {
	const { reorderItem, getListLength } = useListContext();

	const isMoveUpDisabled = position === 'first' || position === 'only';
	const isMoveDownDisabled = position === 'last' || position === 'only';

	const moveToTop = useCallback(() => {
		reorderItem({
			startIndex: index,
			indexOfTarget: 0,
			closestEdgeOfTarget: null,
		});
	}, [index, reorderItem]);

	const moveUp = useCallback(() => {
		reorderItem({
			startIndex: index,
			indexOfTarget: index - 1,
			closestEdgeOfTarget: null,
		});
	}, [index, reorderItem]);

	const moveDown = useCallback(() => {
		reorderItem({
			startIndex: index,
			indexOfTarget: index + 1,
			closestEdgeOfTarget: null,
		});
	}, [index, reorderItem]);

	const moveToBottom = useCallback(() => {
		reorderItem({
			startIndex: index,
			indexOfTarget: getListLength() - 1,
			closestEdgeOfTarget: null,
		});
	}, [index, getListLength, reorderItem]);

	return (
		<DropdownItemGroup>
			<DropdownItem onClick={moveToTop} isDisabled={isMoveUpDisabled}>
				Move to top
			</DropdownItem>
			<DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
				Move up
			</DropdownItem>
			<DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
				Move down
			</DropdownItem>
			<DropdownItem onClick={moveToBottom} isDisabled={isMoveDownDisabled}>
				Move to bottom
			</DropdownItem>
		</DropdownItemGroup>
	);
}

const ListItem = memo(function ListItem({
	item,
	index,
	virtualItem,
	position,
}: {
	item: Item;
	index: number;
	virtualItem: VirtualItem;
	position: ItemPosition;
}) {
	const { registerItem, instanceId } = useListContext();

	const innerRef = useRef<HTMLDivElement>(null);

	const dragHandleRef = useRef<HTMLButtonElement>(null);

	const [state, setState] = useState<ItemState>(idleState);

	useEffect(() => {
		const element = innerRef.current;
		invariant(element);
		invariant(dragHandleRef.current);

		function predicate({ source }: { source: ElementDragPayload }): boolean {
			return (
				isItemData(source.data) &&
				source.data.instanceId === instanceId &&
				source.data.item.id !== item.id
			);
		}

		const data = getItemData({ item, index, instanceId });

		return combine(
			registerItem({ itemId: item.id, element }),
			draggable({
				element,
				dragHandle: dragHandleRef.current,
				getInitialData: () => data,
				onGenerateDragPreview({ nativeSetDragImage }) {
					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset: pointerOutsideOfPreview({
							x: token('space.200', '16px'),
							y: token('space.100', '8px'),
						}),
						render({ container }) {
							setState({ type: 'preview', container });

							return () => setState(draggingState);
						},
					});
				},
				onDragStart() {
					setState(draggingState);
				},
				onDrop() {
					setState(idleState);
				},
			}),
			dropTargetForElements({
				element,
				canDrop: predicate,
				getIsSticky: () => true,
				getData({ input }) {
					return attachClosestEdge(data, {
						element,
						input,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDrag({ self }) {
					const closestEdge = extractClosestEdge(self.data);

					setState((current) => {
						if (current.type === 'is-over' && current.closestEdge === closestEdge) {
							return current;
						}
						return { type: 'is-over', closestEdge };
					});
				},
				onDragLeave() {
					setState(idleState);
				},
				onDrop() {
					setState(idleState);
				},
			}),
		);
	}, [instanceId, item, index, registerItem]);

	return (
		<Fragment>
			<Box
				xcss={itemOuterStyles}
				style={{
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					position: 'absolute',
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					top: 0,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					left: 0,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					width: '100%',
					height: `${virtualItem.size}px`,
					// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
					boxSizing: 'border-box',
					transform: `translateY(${virtualItem.start}px)`,
					// Our items are pressed up next to each other, and are
					// positioned using `position:absolute`.
					// The drop indicator of one item needs to sit partially
					// on top of the other item.
					zIndex: state.type === 'is-over' && state.closestEdge ? 1 : undefined,
				}}
			>
				{/**
				 * Positioning the drop indicator as a sibling so that it's `position:absolute` does
				 * not need to take into account the borders of the item
				 * https://codesandbox.io/p/sandbox/position-relative-and-borders-rjs9gr?file=%2Fsrc%2Fstyles.css%3A15%2C2
				 */}
				<Box
					style={{
						// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
						position: 'relative',
						height: sizes.item.inner,
					}}
				>
					<Grid
						ref={innerRef}
						alignItems="center"
						columnGap="space.100"
						templateColumns="auto 1fr auto"
						xcss={[
							listItemInnerStyles,
							/**
							 * We are applying the disabled effect to the inner element so that
							 * the border and drop indicator are not affected.
							 */
							state.type === 'dragging' && listItemDisabledStyles,
						]}
					>
						<DropdownMenu
							trigger={({ triggerRef, ...triggerProps }) => (
								<DragHandleButton
									ref={mergeRefs([dragHandleRef, triggerRef])}
									{...triggerProps}
									label={`Reorder ${item.label}`}
									style={{
										pointerEvents: state.type !== 'idle' ? 'none' : undefined,
									}}
								/>
							)}
						>
							<DropdownItemGroup>
								<DropDownContent position={position} index={index} />
							</DropdownItemGroup>
						</DropdownMenu>
						<Box xcss={itemLabelStyles}>{item.label}</Box>
						<Inline alignBlock="center" space="space.100">
							<Badge>{1}</Badge>
							<Avatar size="small" />
							<Lozenge>Todo</Lozenge>
						</Inline>
					</Grid>
					{state.type === 'is-over' && state.closestEdge && (
						<DropIndicator
							edge={state.closestEdge}
							gap={`${sizes.item.outer - sizes.item.inner}px`}
						/>
					)}
				</Box>
			</Box>
			{state.type === 'preview' &&
				ReactDOM.createPortal(
					<Box xcss={listItemPreviewStyles}>{item.label}</Box>,
					state.container,
				)}
		</Fragment>
	);
});

let count: number = 0;
function getItems({ amount }: { amount: number }): Item[] {
	return Array.from({ length: amount }, (): Item => {
		const id = `task:${count++}`;
		return {
			id,
			label: `Task: ${id}`,
		};
	});
}

const scrollContainerStyles = xcss({
	maxWidth: '400px',
	height: '400px',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	overflowY: 'scroll',
});

function getItemRegistry() {
	const registry = new Map<string, HTMLElement>();

	function register({ itemId, element }: ItemEntry) {
		registry.set(itemId, element);

		return function unregister() {
			// Due to how the virtualizer works,
			// a new item can be mounted before an old
			// item is removed.
			// We don't want `unregister` to remove
			// a new registration
			if (registry.get(itemId) === element) {
				registry.delete(itemId);
			}
		};
	}

	function getElement(itemId: string): HTMLElement | null {
		return registry.get(itemId) ?? null;
	}

	return { register, getElement };
}

type ListState = {
	items: Item[];
	lastCardMoved: {
		item: Item;
		previousIndex: number;
		currentIndex: number;
		numberOfItems: number;
	} | null;
};

export default function ListExample() {
	const [{ items, lastCardMoved }, setListState] = useState<ListState>(() => ({
		items: getItems({ amount: 200 }),
		lastCardMoved: null,
	}));
	const [registry] = useState(getItemRegistry);

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	const rowVirtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => scrollContainerRef.current,
		estimateSize: () => sizes.item.outer,
		overscan: 2, // not sure if this is strictly needed, but just being safe
	});

	// Isolated instances of this component from one another
	const [instanceId] = useState(() => Symbol('instance-id'));

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
		if (lastCardMoved === null) {
			return;
		}

		const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved;

		liveRegion.announce(
			`You've moved ${item.label} from position ${
				previousIndex + 1
			} to position ${currentIndex + 1} of ${numberOfItems}.`,
		);

		// Not sure why, but can only scroll to the updated index after a timeout
		setTimeout(() => {
			// need to make the item visible before it will appear in our registry
			rowVirtualizer.scrollToIndex(currentIndex);

			// Now waiting for new elements to be registered before we trigger a flash
			// Unfortunately, there is no great way to wait for the virualizer to update
			// `options.onChange` works at the top level.
			// If anybody has suggestions on how to do this better, please let us know!
			setTimeout(() => {
				const element = registry.getElement(item.id);
				if (element) {
					triggerPostMoveFlash(element);
				}
			}, 100);
		});
	}, [lastCardMoved, rowVirtualizer, registry]);

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		invariant(scrollContainer);

		function canRespond({ source }: { source: ElementDragPayload }) {
			return isItemData(source.data) && source.data.instanceId === instanceId;
		}

		// While scrolling, the browser can incorrectly think the cursor is
		// over the drag handle button. This is a little workaround to
		// disable pointer events on the buttons while dragging.
		//
		// TODO: can we fix this in pdnd, or in our drag handle button?
		// https://product-fabric.atlassian.net/browse/DSP-17753
		function fixCursorOnButtons() {
			invariant(scrollContainer);
			scrollContainer.setAttribute('data-is-dragging', 'true');
			const element = document.createElement('style');
			document.head.appendChild(element);
			element.sheet?.insertRule('[data-is-dragging] button { pointer-events: none; }');

			return function cleanup() {
				document.head.removeChild(element);
				scrollContainer.removeAttribute('data-is-dragging');
			};
		}

		let cleanupStyles: CleanupFn | null = null;

		return combine(
			monitorForElements({
				canMonitor: canRespond,
				onDragStart() {
					cleanupStyles = fixCursorOnButtons();
				},
				onDrop({ location, source }) {
					cleanupStyles?.();
					cleanupStyles = null;

					const target = location.current.dropTargets[0];
					if (!target) {
						return;
					}

					const sourceData = source.data;
					const targetData = target.data;
					if (!isItemData(sourceData) || !isItemData(targetData)) {
						return;
					}

					const indexOfTarget = items.findIndex((item) => item.id === targetData.item.id);
					if (indexOfTarget < 0) {
						return;
					}

					const closestEdgeOfTarget = extractClosestEdge(targetData);

					reorderItem({
						startIndex: sourceData.index,
						indexOfTarget,
						closestEdgeOfTarget,
					});
				},
			}),
			autoScrollForElements({
				canScroll: canRespond,
				element: scrollContainer,
			}),
		);
	}, [instanceId, items, reorderItem]);

	// cleanup the live region when this component is finished
	useEffect(() => {
		return function cleanup() {
			liveRegion.cleanup();
		};
	}, []);

	const getListLength = useCallback(() => items.length, [items.length]);

	const contextValue: ListContextValue = useMemo(() => {
		return {
			registerItem: registry.register,
			reorderItem,
			instanceId,
			getListLength,
		};
	}, [registry.register, reorderItem, instanceId, getListLength]);

	return (
		<ListContext.Provider value={contextValue}>
			<Box ref={scrollContainerRef} xcss={scrollContainerStyles}>
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
						width: '100%',
						// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
						position: 'relative',
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualItem) => (
						<ListItem
							key={virtualItem.key}
							item={items[virtualItem.index]}
							virtualItem={virtualItem}
							index={virtualItem.index}
							position={getItemPosition({ index: virtualItem.index, items })}
						/>
					))}
				</div>
			</Box>
		</ListContext.Provider>
	);
}
