/** @jsx jsx */
import { Fragment, useContext, useEffect, useRef, useState } from 'react';

import { css, jsx, type SerializedStyles } from '@emotion/react';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box-without-terminal';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import { Box, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { minColumnWidth } from './constants';
import { ColumnMenuButton } from './menu-button';
import { getField, getProperty } from './render-pieces';
import { TableContext } from './table-context';
import { type Item } from './types';

type HeaderState =
  | {
      type: 'idle';
    }
  | {
      type: 'preview';
      container: HTMLElement;
    }
  | {
      type: 'dragging';
    }
  | {
      type: 'drop-target';
      closestEdge: Edge | null;
    }
  | {
      type: 'resizing';
      initialWidth: number;
      tableWidth: number;
      nextHeaderInitialWidth: number;
      nextHeader: HTMLElement;
      maxWidth: number;
    };

/**
 * These two state types have no associated information, so we can create stable
 * references for both types.
 *
 * By using these stable references, we can avoid unnecessary rerenders which
 * may occur if we try to enter the state when we are already in it.
 *
 * To visualize this, consider:
 * ```ts
 * setState({ type: ‘dragging’ });
 * // This second call will trigger a rerender because it is a new object
 * setState({ type: ‘dragging’ });
 *
 * // in comparison to
 *
 * setState(draggingState);
 * // This second call will NOT trigger a rerender, it is the same object
 * setState(draggingState);
 * ```
 */
const idleState: HeaderState = { type: 'idle' };
const draggingState: HeaderState = { type: 'dragging' };

function clamp({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  return Math.max(min, Math.min(value, max));
}

const headerDraggingStyles = css({
  background: token('color.background.disabled', '#091E4224'),
  color: token('color.text.disabled', '#091E424F'),
});

type ColumnType =
  | 'first-of-many'
  | 'middle-of-many'
  | 'last-of-many'
  | 'only-column';

const resizerStyles = css({
  '--local-hitbox-width': token('space.300', '24px'),
  width: 'var(--local-hitbox-width)',
  cursor: 'col-resize',
  flexGrow: '0',
  position: 'absolute',
  zIndex: 1, // we want this to sit on top of adjacent column headers
  right: 'calc(-1 * calc(var(--local-hitbox-width) / 2))',
  top: 0,
  height: 'var(--table-height)',

  '::before': {
    opacity: 0,
    '--local-line-width': token('border.width', '2px'),
    content: '""',
    position: 'absolute',
    background: token('color.border.brand', '#0052CC'),
    // Jesse would like us to use 'color.border' for hover, then brand while resizing
    // However,
    // - right now that is inconsistent with our sidebar
    // - we get a bad outcome when the borders overlap with the header border
    width: 'var(--local-line-width)',
    inset: 0,
    left: `calc(50% - calc(var(--local-line-width) / 2))`,
    transition: 'opacity 0.2s ease',
  },

  ':hover::before': {
    opacity: 1,
  },
});

const resizingStyles = css({
  // turning off the resizing cursor as sometimes it can cause the cursor to flicker
  // while resizing. The browser controls the cursor while dragging, but the browser
  // can sometimes bug out.
  cursor: 'unset',
  '::before': {
    opacity: 1,
  },
});

const sharedDropTargetStyles = css({
  position: 'absolute',
  top: 0,
  height: 'var(--table-height)',
});

const dropTargetStyles: {
  // Don't need to provide styles for only-column
  [key in Exclude<ColumnType, 'only-column'>]: SerializedStyles[];
} = {
  'first-of-many': [
    sharedDropTargetStyles,
    css({
      right: 0,
      // for the first item, we are pushing a bit off the left so that the drop
      // indicator will sit completely inside the table and not be cut off by table borders
      left: 1,
    }),
  ],
  'middle-of-many': [
    sharedDropTargetStyles,
    css({
      left: 0,
      right: 0,
    }),
  ],
  'last-of-many': [
    sharedDropTargetStyles,
    css({
      left: 0,
      // for the last item, we are pushing a bit off the right so that the drop
      // indicator will sit completely inside the table and not be cut off by table borders
      right: 1,
    }),
  ],
};

const thStyles = css({
  borderBottom: `2px solid ${token('color.border', 'red')}`,
  // Need position:relative so our drop indicator (which uses position:absolute) can be
  // correctly positioned inside
  position: 'relative',
  // using border box sizing as that is what we will be applying as the width for `--local-resizing-width`
  boxSizing: 'border-box',
  width: 'var(--local-resizing-width)',

  paddingBlock: 8,
});

function getColumnType({
  index,
  amountOfHeaders,
}: {
  index: number;
  amountOfHeaders: number;
}): ColumnType {
  if (amountOfHeaders === 1) {
    return 'only-column';
  }
  if (index === 0) {
    return 'first-of-many';
  }
  if (index === amountOfHeaders - 1) {
    return 'last-of-many';
  }
  return 'middle-of-many';
}

export function TableHeader({
  property,
  index,
  amountOfHeaders,
}: {
  property: keyof Item;
  index: number;
  amountOfHeaders: number;
}) {
  const ref = useRef<HTMLTableCellElement | null>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<HeaderState>(idleState);
  const columnType: ColumnType = getColumnType({ index, amountOfHeaders });

  const { instanceId } = useContext(TableContext);

  // detect whether we should show a full height drop target
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return (
          source.data.instanceId === instanceId &&
          source.data.type === 'table-header' &&
          source.data.property !== property
        );
      },
      onDragStart() {
        const el = ref.current;
        invariant(el);

        setState({
          type: 'drop-target',
          closestEdge: null,
        });
      },
      onDrop() {
        setState(idleState);
      },
    });
  }, [instanceId, property]);

  // Creating a drop target to power reordering the column headers
  // We are dynamically creating the drop targets after the drag starts
  // We are making the drop targets the full height of the table
  // so that the user can reorder the column anywhere on the edge of the column
  useEffect(() => {
    if (state.type !== 'drop-target') {
      return;
    }

    const dropTarget = dropTargetRef.current;
    invariant(dropTarget);
    return dropTargetForElements({
      element: dropTarget,
      getData({ input, element }) {
        const data = { property, index };
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['left', 'right'],
        });
      },
      canDrop({ source }) {
        return (
          source.data.instanceId === instanceId &&
          source.data.type === 'table-header' &&
          source.data.property !== property
        );
      },
      onDrag(args) {
        // only update the state if the closestEdge has changed
        // Doing this to prevent lots of react re-renders
        setState(current => {
          if (current.type !== 'drop-target') {
            return current;
          }
          const closestEdge: Edge | null = extractClosestEdge(args.self.data);
          if (current.closestEdge === closestEdge) {
            return current;
          }
          return {
            type: 'drop-target',
            closestEdge,
          };
        });

        setState({
          type: 'drop-target',
          closestEdge: extractClosestEdge(args.self.data),
        });
      },
      onDragLeave() {
        setState({
          type: 'drop-target',
          closestEdge: null,
        });
      },
      onDrop() {
        setState(idleState);
      },
    });
  }, [state.type, property, index, instanceId]);

  // Setting up the draggable header
  useEffect(() => {
    const el = ref.current;
    invariant(el);

    const dragHandle = dragHandleRef.current;
    invariant(dragHandle);

    return draggable({
      element: el,
      dragHandle,
      getInitialData() {
        return { type: 'table-header', property, index, instanceId };
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({
            x: '18px',
            y: '18px',
          }),
          render: ({ container }) => {
            // Cause a `react` re-render to create your portal synchronously
            setState({ type: 'preview', container });
            // In our cleanup function: cause a `react` re-render to create remove your portal
            // Note: you can also remove the portal in `onDragStart`,
            // which is when the cleanup function is called
            return () => setState(draggingState);
          },
          nativeSetDragImage,
        });
      },
      onDragStart() {
        setState(draggingState);
      },
      onDrop() {
        setState(idleState);
      },
    });
  }, [property, index, instanceId]);

  const renderResizeHandle: boolean =
    (state.type === 'idle' || state.type === 'resizing') &&
    (columnType === 'first-of-many' || columnType === 'middle-of-many');

  // Setting up the draggable resize handle
  // How resizing works:
  // 1. change the size of the column header being dragged
  // 2. we change the _next_ column header by the opposite amount
  useEffect(() => {
    if (!renderResizeHandle) {
      return;
    }

    const handle = resizerRef.current;
    invariant(handle);
    const header = ref.current;
    invariant(header);

    return draggable({
      element: handle,
      getInitialData() {
        return { type: 'column-resize', property, index, instanceId };
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        disableNativeDragPreview({ nativeSetDragImage });
        preventUnhandled.start();

        const initialWidth = header.getBoundingClientRect().width;

        const nextHeader = header.nextElementSibling;
        invariant(nextHeader instanceof HTMLElement);
        const nextHeaderInitialWidth = nextHeader.getBoundingClientRect().width;

        const table = header.closest('table');
        invariant(table);
        const tableWidth = table.getBoundingClientRect().width;

        // We cannot let `nextHeader` get smaller than `minColumnWidth`
        const maxWidth = initialWidth + nextHeaderInitialWidth - minColumnWidth;

        setState({
          type: 'resizing',
          initialWidth,
          tableWidth,
          nextHeaderInitialWidth,
          nextHeader,
          maxWidth,
        });
      },
      onDrag({ location }) {
        const diffX =
          location.current.input.clientX - location.initial.input.clientX;

        invariant(state.type === 'resizing');
        const { initialWidth, nextHeaderInitialWidth, nextHeader, maxWidth } =
          state;

        // Set the width of our header being resized
        const proposedWidth = clamp({
          value: initialWidth + diffX,
          min: minColumnWidth,
          max: maxWidth,
        });
        header.style.setProperty(
          '--local-resizing-width',
          `${proposedWidth}px`,
        );

        // How much did the width of the header actually change?
        const actualDiff = proposedWidth - initialWidth;

        // Now we need to make the opposite change to the next header
        //
        // Example: we have two columns A and B
        // If A is resizing to get larger, B needs to get smaller
        nextHeader.style.setProperty(
          '--local-resizing-width',
          `${nextHeaderInitialWidth - actualDiff}px`,
        );
      },
      onDrop() {
        preventUnhandled.stop();
        setState(idleState);
      },
    });
  }, [renderResizeHandle, index, property, state, instanceId]);

  const label = getProperty(property);

  return (
    <Fragment>
      <th
        ref={ref}
        css={[
          thStyles,
          state.type === 'dragging' ? headerDraggingStyles : undefined,
        ]}
      >
        {label}

        <ColumnMenuButton
          ref={dragHandleRef}
          columnIndex={index}
          amountOfHeaders={amountOfHeaders}
        />

        {/* Resizer */}
        {renderResizeHandle ? (
          <div
            ref={resizerRef}
            css={[
              resizerStyles,
              state.type === 'resizing' ? resizingStyles : undefined,
            ]}
          ></div>
        ) : null}

        {/* DropTarget */}
        {state.type === 'drop-target' && columnType !== 'only-column' ? (
          <div ref={dropTargetRef} css={dropTargetStyles[columnType]}>
            {state.closestEdge && <DropIndicator edge={state.closestEdge} />}
          </div>
        ) : null}
      </th>
      {state.type === 'preview'
        ? ReactDOM.createPortal(
            <ColumnPreview property={property} />,
            state.container,
          )
        : null}
    </Fragment>
  );
}

const previewStyles = xcss({
  borderRadius: 'border.radius.100',
  minWidth: '220px',
});

const previewHeaderStyles = xcss({
  fontWeight: token('font.weight.bold', 'bold'),
  borderBottom: `2px solid ${token('color.border', 'red')}`,
  lineHeight: '32px',
});

function ColumnPreview({ property }: { property: keyof Item }) {
  const context = useContext(TableContext);

  const { items, isMoreItems } = context.getItemsForColumnPreview();

  return (
    <Box
      backgroundColor="elevation.surface"
      padding="space.100"
      paddingBlockStart="space.0"
      xcss={previewStyles}
    >
      <Stack space="space.050">
        <Box xcss={previewHeaderStyles}>{getProperty(property)}</Box>
        {items.map(item => (
          <div key={item.id}>{getField({ item, property })}</div>
        ))}
        {/* Only show "+ more" if there are actually more items */}
        {isMoreItems ? <em>+ more</em> : null}
      </Stack>
    </Box>
  );
}
