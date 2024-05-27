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
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import Lozenge from '@atlaskit/lozenge';
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

type ListContextProps = {
  getItemIndex: ({ id }: { id: string }) => number;
  getItemPosition: (itemData: ItemData) => ItemPosition;
  registerItem: (args: { id: string; element: HTMLElement }) => CleanupFn;
  reorderItem: (args: {
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
  }) => void;
  instanceId: symbol;
};

const ListContext = createContext<ListContextProps | null>(null);

function useListContext() {
  const listContext = useContext(ListContext);
  invariant(listContext !== null);
  return listContext;
}

type ItemData = {
  id: string;
  label: string;
};

const listItemContainerStyles = xcss({
  position: 'relative',
  backgroundColor: 'elevation.surface',
  borderWidth: 'border.width.0',
  borderBottomWidth: token('border.width', '1px'),
  borderStyle: 'solid',
  borderColor: 'color.border',
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

function ListItem({ itemData }: { itemData: ItemData }) {
  const { getItemIndex, registerItem, instanceId } = useListContext();

  const ref = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const dragHandleRef = useRef<HTMLButtonElement>(null);

  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState);

  useEffect(() => {
    invariant(ref.current);
    invariant(dragHandleRef.current);

    const element = ref.current;

    const dragData = { id: itemData.id, instanceId };

    return combine(
      registerItem({ id: itemData.id, element }),
      draggable({
        element,
        dragHandle: dragHandleRef.current,
        getInitialData() {
          return { ...dragData, index: getItemIndex(itemData) };
        },
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
          return source.data.instanceId === instanceId;
        },
        getData({ input }) {
          return attachClosestEdge(dragData, {
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

          const selfIndex = getItemIndex({ id: itemData.id });

          const isItemBeforeSource = selfIndex === sourceIndex - 1;
          const isItemAfterSource = selfIndex === sourceIndex + 1;

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
  }, [getItemIndex, instanceId, itemData, registerItem]);

  return (
    <Fragment>
      <Box ref={ref} xcss={listItemContainerStyles}>
        <Grid
          alignItems="center"
          columnGap="space.100"
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
                label={`Reorder ${itemData.label}`}
              />
            )}
          >
            <LazyDropdownContent itemData={itemData} />
          </DropdownMenu>
          <Box xcss={itemLabelStyles}>{itemData.label}</Box>
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
          <Box xcss={listItemPreviewStyles}>{itemData.label}</Box>,
          draggableState.container,
        )}
    </Fragment>
  );
}

function LazyDropdownContent({ itemData }: { itemData: ItemData }) {
  const { getItemIndex, getItemPosition, reorderItem } = useListContext();

  const position = getItemPosition(itemData);

  const isMoveUpDisabled = position === 'first' || position === 'only';
  const isMoveDownDisabled = position === 'last' || position === 'only';

  const moveUp = useCallback(() => {
    const startIndex = getItemIndex(itemData);
    reorderItem({
      startIndex,
      indexOfTarget: startIndex - 1,
      closestEdgeOfTarget: null,
    });
  }, [getItemIndex, itemData, reorderItem]);

  const moveDown = useCallback(() => {
    const startIndex = getItemIndex(itemData);
    reorderItem({
      startIndex,
      indexOfTarget: startIndex + 1,
      closestEdgeOfTarget: null,
    });
  }, [getItemIndex, itemData, reorderItem]);

  return (
    <DropdownItemGroup>
      <DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
        Move up
      </DropdownItem>
      <DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
        Move down
      </DropdownItem>
    </DropdownItemGroup>
  );
}

const defaultItems: ItemData[] = [
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

type ListState = {
  items: ItemData[];
  lastCardMoved: {
    item: ItemData;
    previousIndex: number;
    currentIndex: number;
    numberOfItems: number;
  } | null;
};

export default function ListExample({
  triggerPostMoveFlash,
}: {
  triggerPostMoveFlash: (element: HTMLElement) => void;
}) {
  const [{ items, lastCardMoved }, setListState] = useState<ListState>({
    items: defaultItems,
    lastCardMoved: {
      item: defaultItems[0],
      previousIndex: 0,
      currentIndex: 0,
      numberOfItems: defaultItems.length,
    },
  });

  const registryRef = useRef(new Map<string, HTMLElement>());
  const registerItem = useCallback(
    ({ id, element }: { id: string; element: HTMLElement }) => {
      const registry = registryRef.current;
      if (!registry) {
        return () => {};
      }
      registry.set(id, element);

      return function unregisterItem() {
        registry.delete(id);
      };
    },
    [],
  );

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
  }, [lastCardMoved, triggerPostMoveFlash]);

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

      setListState(listState => {
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

  const [instanceId] = useState(() => Symbol('instance-id'));

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.instanceId === instanceId;
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const items = stableItemsRef.current;

        const startIndex = items.findIndex(item => item.id === source.data.id);
        if (startIndex < 0) {
          return;
        }

        const indexOfTarget = items.findIndex(
          item => item.id === target.data.id,
        );
        if (indexOfTarget < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(target.data);

        reorderItem({ startIndex, indexOfTarget, closestEdgeOfTarget });
      },
    });
  }, [instanceId, reorderItem]);

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
    return stableItemsRef.current.findIndex(item => item.id === id);
  }, []);

  const contextValue = useMemo(() => {
    return {
      getItemIndex,
      getItemPosition,
      registerItem,
      reorderItem,
      instanceId,
    };
  }, [getItemIndex, getItemPosition, registerItem, reorderItem, instanceId]);

  return (
    <ListContext.Provider value={contextValue}>
      <Stack xcss={containerStyles}>
        {items.map(itemData => (
          <ListItem key={itemData.id} itemData={itemData} />
        ))}
      </Stack>
    </ListContext.Provider>
  );
}
