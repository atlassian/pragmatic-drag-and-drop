import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { easeInOut, mediumDurationMs } from '@atlaskit/motion';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Box, Grid, Inline, Stack, xcss } from '@atlaskit/primitives';

const itemIdStyles = xcss({
  margin: '0',
});

const itemContainerStyles = xcss({
  padding: 'space.100',
  borderWidth: 'border.width',
  borderStyle: 'dashed',
  borderColor: 'color.border',
});

const itemContentStyles = xcss({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'space.100',
  userSelect: 'none',
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderColor: 'color.border.bold',
});

const itemStateStyles = {
  enabled: xcss({
    backgroundColor: 'color.background.accent.green.subtlest',
  }),
  disabled: xcss({
    backgroundColor: 'color.background.accent.red.subtlest',
  }),
  dragging: xcss({
    opacity: 0.4,
  }),
};

function Item({
  itemId,
  children,
}: {
  itemId: string;
  children?: React.ReactElement | React.ReactElement[];
}) {
  const [isDraggingAllowed, setIsDraggingAllowed] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const ref = useRef<HTMLLabelElement | null>(null);
  itemContentStyles;
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return draggable({
      element,
      canDrag: () => isDraggingAllowed,
      getInitialData: () => ({ itemId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [itemId, isDraggingAllowed]);

  return (
    <Stack
      xcss={[
        itemContainerStyles,
        isDraggingAllowed ? itemStateStyles.enabled : itemStateStyles.disabled,
      ]}
      space="space.050"
    >
      <Box
        as="label"
        ref={ref}
        xcss={[
          itemContentStyles,
          isDragging ? itemStateStyles.dragging : undefined,
        ]}
      >
        <Inline space="space.050">
          <input
            onChange={() => setIsDraggingAllowed(value => !value)}
            type="checkbox"
            checked={isDraggingAllowed}
          ></input>
          Dragging allowed?
        </Inline>
        <Box as="small" xcss={itemIdStyles}>
          (id: {itemId})
        </Box>
      </Box>
      {children ? <Stack space="space.050">{children}</Stack> : null}
    </Stack>
  );
}

const dropTargetStyles = xcss({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 'border.width',
  borderColor: 'color.border.discovery',
  borderStyle: 'solid',
  backgroundColor: 'color.background.discovery',
  transitionProperty: 'background-color, border-color',
  transitionDuration: `${mediumDurationMs}ms`,
  transitionTimingFunction: easeInOut,
});

const dropTargetIsOverStyles = xcss({
  borderColor: 'color.border.accent.blue',
  backgroundColor: 'color.background.selected.hovered',
});

function DropTarget() {
  const [state, setState] = useState<'idle' | 'is-over'>('idle');
  const ref = useRef<HTMLDivElement | null>(null);
  const [lastDropped, setLastDropped] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return dropTargetForElements({
      element,
      onDragStart: () => setState('idle'),
      onDragEnter: () => setState('is-over'),
      onDragLeave: () => setState('idle'),
      onDrop: ({ source }) => {
        setState('idle');

        if (typeof source.data.itemId !== 'string') {
          return;
        }
        setLastDropped(source.data.itemId);
      },
    });
  }, []);
  return (
    <Box
      xcss={[
        dropTargetStyles,
        state === 'is-over' ? dropTargetIsOverStyles : undefined,
      ]}
      ref={ref}
    >
      <Stack alignInline="center">
        <strong>Drop on me!</strong>
        <em>
          Last dropped: <code>{lastDropped ?? 'none'}</code>
        </em>
      </Stack>
    </Box>
  );
}

export default function Example() {
  return (
    <Grid templateColumns="1fr 1fr" gap="space.100">
      <Item itemId="1">
        <Item itemId="1-1">
          <Item itemId="1-1-1" />
          <Item itemId="1-1-2" />
        </Item>
        <Item itemId="1-2">
          <Item itemId="1-2-1" />
          <Item itemId="1-2-2" />
        </Item>
      </Item>
      <DropTarget />
    </Grid>
  );
}
