import React, {
	createContext,
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Lozenge from '@atlaskit/lozenge';
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
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { Box, Grid, Inline, Stack, xcss } from '@atlaskit/primitives';
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

const listItemContainerStyles = xcss({
	position: 'relative',
	backgroundColor: 'elevation.surface',
	borderWidth: 'border.width.0',
	borderBottomWidth: token('border.width', '1px'),
	borderStyle: 'solid',
	borderColor: 'color.border',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':last-of-type': {
		borderWidth: 'border.width.0',
	},
});

const listItemStyles = xcss({
	position: 'relative',
	padding: 'space.100',
});

const listItemDisabledStyles = xcss({ opacity: 0.4 });

type DraggableState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement }
	| { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

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

function ListItem({
	item,
	index,
	position,
}: {
	item: Item;
	index: number;
	position: ItemPosition;
}) {
	const { registerItem, instanceId } = useListContext();

	const ref = useRef<HTMLDivElement>(null);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	const dragHandleRef = useRef<HTMLButtonElement>(null);

	const [draggableState, setDraggableState] = useState<DraggableState>(idleState);

	useEffect(() => {
		const element = ref.current;
		const dragHandle = dragHandleRef.current;
		invariant(element);
		invariant(dragHandle);

		const data = getItemData({ item, index, instanceId });

		return combine(
			registerItem({ itemId: item.id, element }),
			draggable({
				element: dragHandle,
				getInitialData: () => data,
				onGenerateDragPreview({ nativeSetDragImage }) {
					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset: pointerOutsideOfPreview({
							x: token('space.200', '16px'),
							y: token('space.100', '8px'),
						}),
						render({ container }) {
							setDraggableState({ type: 'preview', container });

							return () => setDraggableState(draggingState);
						},
					});
				},
				onDragStart() {
					setDraggableState(draggingState);
				},
				onDrop() {
					setDraggableState(idleState);
				},
			}),
			dropTargetForElements({
				element,
				canDrop({ source }) {
					return isItemData(source.data) && source.data.instanceId === instanceId;
				},
				getData({ input }) {
					return attachClosestEdge(data, {
						element,
						input,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDrag({ self, source }) {
					const isSource = source.element === element;
					if (isSource) {
						setClosestEdge(null);
						return;
					}

					const closestEdge = extractClosestEdge(self.data);

					const sourceIndex = source.data.index;
					invariant(typeof sourceIndex === 'number');

					const isItemBeforeSource = index === sourceIndex - 1;
					const isItemAfterSource = index === sourceIndex + 1;

					const isDropIndicatorHidden =
						(isItemBeforeSource && closestEdge === 'bottom') ||
						(isItemAfterSource && closestEdge === 'top');

					if (isDropIndicatorHidden) {
						setClosestEdge(null);
						return;
					}

					setClosestEdge(closestEdge);
				},
				onDragLeave() {
					setClosestEdge(null);
				},
				onDrop() {
					setClosestEdge(null);
				},
			}),
		);
	}, [instanceId, item, index, registerItem]);

	return (
		<Fragment>
			<Box ref={ref} xcss={listItemContainerStyles}>
				<Grid
					alignItems="center"
					columnGap="space.050"
					templateColumns="auto 1fr auto"
					xcss={[
						listItemStyles,
						/**
						 * We are applying the disabled effect to the inner element so that
						 * the border and drop indicator are not affected.
						 */
						draggableState.type === 'dragging' && listItemDisabledStyles,
					]}
				>
					<DropdownMenu
						trigger={({ triggerRef, ...triggerProps }) => (
							<DragHandleButton
								ref={mergeRefs([dragHandleRef, triggerRef])}
								{...triggerProps}
								label={`Reorder ${item.label}`}
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
				{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
			</Box>
			{draggableState.type === 'preview' &&
				ReactDOM.createPortal(
					<Box xcss={listItemPreviewStyles}>{item.label}</Box>,
					draggableState.container,
				)}
		</Fragment>
	);
}

const defaultItems: Item[] = [
	{
		id: 'task-1',
		label: 'Organize a team-building event',
	},
	{
		id: 'task-2',
		label: 'Create and maintain office inventory',
	},
	{
		id: 'task-3',
		label: 'Update company website content',
	},
	{
		id: 'task-4',
		label: 'Plan and execute marketing campaigns',
	},
	{
		id: 'task-5',
		label: 'Coordinate employee training sessions',
	},
	{
		id: 'task-6',
		label: 'Manage facility maintenance',
	},
	{
		id: 'task-7',
		label: 'Organize customer feedback surveys',
	},
	{
		id: 'task-8',
		label: 'Coordinate travel arrangements',
	},
];

const containerStyles = xcss({
	maxWidth: '400px',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
});

function getItemRegistry() {
	const registry = new Map<string, HTMLElement>();

	function register({ itemId, element }: ItemEntry) {
		registry.set(itemId, element);

		return function unregister() {
			registry.delete(itemId);
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
	const [{ items, lastCardMoved }, setListState] = useState<ListState>({
		items: defaultItems,
		lastCardMoved: null,
	});
	const [registry] = useState(getItemRegistry);

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
		return monitorForElements({
			canMonitor({ source }) {
				return isItemData(source.data) && source.data.instanceId === instanceId;
			},
			onDrop({ location, source }) {
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
		});
	}, [instanceId, items, reorderItem]);

	// once a drag is finished, we have some post drop actions to take
	useEffect(() => {
		if (lastCardMoved === null) {
			return;
		}

		const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved;
		const element = registry.getElement(item.id);
		if (element) {
			triggerPostMoveFlash(element);
		}

		liveRegion.announce(
			`You've moved ${item.label} from position ${
				previousIndex + 1
			} to position ${currentIndex + 1} of ${numberOfItems}.`,
		);
	}, [lastCardMoved, registry]);

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
			<Stack xcss={containerStyles}>
				{/*
          It is not expensive for us to pass `index` to items for this example,
          as when reordering, only two items index will ever change.

          If insertion or removal where allowed, it would be worth making
          `index` a getter (eg `getIndex()`) to avoid re-rendering many items
        */}
				{items.map((item, index) => (
					<ListItem
						key={item.id}
						item={item}
						index={index}
						position={getItemPosition({ index, items })}
					/>
				))}
			</Stack>
		</ListContext.Provider>
	);
}
