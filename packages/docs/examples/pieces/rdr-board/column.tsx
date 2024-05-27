/** @jsx jsx */
import {
  memo,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { css, jsx, type SerializedStyles } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, {
  type CustomTriggerProps,
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import Heading from '@atlaskit/heading';
import MoreIcon from '@atlaskit/icon/glyph/more';
import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { token } from '@atlaskit/tokens';

import { cardGap } from '../../util/constants';

import { useBoardContext } from './board-context';
import { Card } from './card';
import {
  ColumnContext,
  type ColumnContextProps,
  useColumnContext,
} from './column-context';
import { type ColumnType } from './data';

const columnStyles = css({
  display: 'flex',
  width: 300,
  flexDirection: 'column',
  background: token('elevation.surface.sunken', '#F7F8F9'),
  borderRadius: '8px',
  transition: `background ${mediumDurationMs}ms ${easeInOut}`,
  position: 'relative',
});

const scrollContainerStyles = css({
  height: '100%',
  overflowY: 'auto',
});

const cardListStyles = css({
  display: 'flex',
  boxSizing: 'border-box',
  minHeight: '100%',
  padding: 'var(--grid)',
  gap: cardGap,
  flexDirection: 'column',
});

const columnHeaderStyles = css({
  display: 'flex',
  padding: 'var(--grid) calc(var(--grid) * 2) 0',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  color: token('color.text.subtlest', '#626F86'),
  userSelect: 'none',
  cursor: 'grab',
});

type IdleState = { type: 'idle' };

type DropTargetState =
  | IdleState
  | { type: 'is-card-over' }
  | { type: 'is-column-over'; closestEdge: Edge | null };

type DraggableState =
  | IdleState
  | { type: 'generate-column-preview'; container: HTMLElement }
  | { type: 'is-dragging' };

// preventing re-renders
const idle: IdleState = { type: 'idle' };
const isCardOver: DropTargetState = { type: 'is-card-over' };
const isDraggingState: DraggableState = { type: 'is-dragging' };

const stateStyles: Partial<Record<DropTargetState['type'], SerializedStyles>> =
  {
    'is-card-over': css({
      background: token('color.background.selected.hovered', '#CCE0FF'),
    }),
  };

const draggableStateStyles: Partial<
  Record<DraggableState['type'], SerializedStyles>
> = {
  'generate-column-preview': css({
    isolation: 'isolate',
  }),

  'is-dragging': css({
    opacity: 0.4,
  }),
};

export const Column = memo(function Column({ column }: { column: ColumnType }) {
  const columnId = column.columnId;
  const columnRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const [dropTargetState, setDropTargetState] = useState<DropTargetState>(idle);
  const [draggableState, setDraggableState] = useState<DraggableState>(idle);

  useEffect(() => {
    invariant(columnRef.current);
    invariant(headerRef.current);
    invariant(cardListRef.current);
    return combine(
      draggable({
        element: columnRef.current,
        dragHandle: headerRef.current,
        getInitialData: () => ({ columnId, type: 'column' }),
        onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
          setCustomNativeDragPreview({
            getOffset: preserveOffsetOnSource({
              element: source.element,
              input: location.current.input,
            }),
            render: ({ container }) => {
              setDraggableState({ type: 'generate-column-preview', container });
              return () => setDraggableState(isDraggingState);
            },
            nativeSetDragImage,
          });
        },
        onDragStart: () => {
          setDraggableState(isDraggingState);
        },
        onDrop() {
          setDraggableState(idle);
        },
      }),
      dropTargetForElements({
        element: cardListRef.current,
        getData: () => ({ columnId }),
        canDrop: args => args.source.data.type === 'card',
        getIsSticky: () => true,
        onDragEnter: () => setDropTargetState(isCardOver),
        onDragLeave: () => setDropTargetState(idle),
        onDragStart: () => setDropTargetState(isCardOver),
        onDrop: () => setDropTargetState(idle),
      }),
      dropTargetForElements({
        element: columnRef.current,
        canDrop: args => args.source.data.type === 'column',
        getIsSticky: () => true,
        getData: ({ input, element }) => {
          const data = {
            columnId,
          };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ['left', 'right'],
          });
        },
        onDragEnter: args => {
          setDropTargetState({
            type: 'is-column-over',
            closestEdge: extractClosestEdge(args.self.data),
          });
        },
        onDrag: args => {
          // skip react re-render if edge is not changing
          setDropTargetState(current => {
            const closestEdge: Edge | null = extractClosestEdge(args.self.data);
            if (
              current.type === 'is-column-over' &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return {
              type: 'is-column-over',
              closestEdge,
            };
          });
        },
        onDragLeave: () => {
          setDropTargetState(idle);
        },
        onDrop: () => {
          setDropTargetState(idle);
        },
      }),
    );
  }, [columnId]);

  const stableItems = useRef(column.items);
  useEffect(() => {
    stableItems.current = column.items;
  }, [column.items]);

  const getCardIndex = useCallback((key: string) => {
    return stableItems.current.findIndex(item => item.key === key);
  }, []);

  const getNumCards = useCallback(() => {
    return stableItems.current.length;
  }, []);

  const contextValue: ColumnContextProps = useMemo(() => {
    return { columnId, getCardIndex, getNumCards };
  }, [columnId, getCardIndex, getNumCards]);

  return (
    <ColumnContext.Provider value={contextValue}>
      <div
        css={[
          columnStyles,
          stateStyles[dropTargetState.type],
          draggableStateStyles[draggableState.type],
        ]}
        ref={columnRef}
      >
        <div
          css={columnHeaderStyles}
          ref={headerRef}
          data-testid={`column-${columnId}--header`}
        >
          <Heading level="h300" as="span">
            {column.title}
          </Heading>
          <ActionMenu />
        </div>
        <div css={scrollContainerStyles}>
          <div css={cardListStyles} ref={cardListRef}>
            {column.items.map(item => (
              <Card item={item} key={item.key} />
            ))}
          </div>
        </div>
        {dropTargetState.type === 'is-column-over' &&
          dropTargetState.closestEdge && (
            <DropIndicator edge={dropTargetState.closestEdge} gap={`8px`} />
          )}
      </div>
      {draggableState.type === 'generate-column-preview'
        ? createPortal(
            <ColumnPreview column={column} />,
            draggableState.container,
          )
        : null}
    </ColumnContext.Provider>
  );
});

const previewStyles = css({
  width: 250,
  background: token('elevation.surface.sunken', '#F7F8F9'),
  borderRadius: 8,
  padding: 16,
});

function ColumnPreview({ column }: { column: ColumnType }) {
  return (
    <div css={[columnHeaderStyles, previewStyles]}>
      <Heading level="h300" as="span">
        {column.title}
      </Heading>
    </div>
  );
}

function ActionMenu() {
  return (
    <DropdownMenu trigger={DropdownMenuTrigger}>
      <ActionMenuItems />
    </DropdownMenu>
  );
}

function ActionMenuItems() {
  const { columnId } = useColumnContext();
  const { getColumns, reorderColumn } = useBoardContext();

  const columns = getColumns();
  const startIndex = columns.findIndex(column => column.columnId === columnId);

  const moveLeft = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex - 1,
    });
  }, [reorderColumn, startIndex]);

  const moveRight = useCallback(() => {
    reorderColumn({
      startIndex,
      finishIndex: startIndex + 1,
    });
  }, [reorderColumn, startIndex]);

  const isMoveLeftDisabled = startIndex === 0;
  const isMoveRightDisabled = startIndex === columns.length - 1;

  return (
    <DropdownItemGroup>
      <DropdownItem onClick={moveLeft} isDisabled={isMoveLeftDisabled}>
        Move left
      </DropdownItem>
      <DropdownItem onClick={moveRight} isDisabled={isMoveRightDisabled}>
        Move right
      </DropdownItem>
    </DropdownItemGroup>
  );
}

function DropdownMenuTrigger({
  triggerRef,
  ...triggerProps
}: CustomTriggerProps) {
  return (
    <IconButton
      ref={triggerRef as Ref<HTMLButtonElement>}
      {...triggerProps}
      appearance="subtle"
      icon={MoreIcon}
      label="Actions"
    />
  );
}
