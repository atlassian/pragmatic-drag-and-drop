import React, { useContext, useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { Box, Flex, Stack, xcss } from '@atlaskit/primitives';

import { autoScrollWindowForElements } from '../../src/entry-point/element';

import { BoardContext } from './board-context';
import { Card } from './card';

function useRequiredContext<TContextValue>(
  Context: React.Context<TContextValue | null>,
): TContextValue {
  const value = useContext<TContextValue | null>(Context);
  invariant(value, 'Could not find context value');
  return value;
}

type TItem = { id: string };
type TColumn = {
  id: string;
  items: TItem[];
};

const columnStyles = xcss({
  overflowY: 'auto',
  height: '300px',
  width: '140px',
  backgroundColor: 'elevation.surface',
  borderColor: 'color.border.accent.purple',
  borderRadius: 'border.radius',
  borderWidth: 'border.width',
  borderStyle: 'solid',
  flexShrink: 0,
});

function Column({ column }: { column: TColumn }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { autoScrollColumn } = useRequiredContext(BoardContext);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      autoScrollColumn({
        element,
      }),
    );
  }, [autoScrollColumn]);

  return (
    <Box ref={ref} xcss={columnStyles} padding="space.100" testId={column.id}>
      <Stack space="space.100">
        {column.items.map(item => (
          <Card key={item.id} item={item} />
        ))}
      </Stack>
    </Box>
  );
}

const boardStyles = xcss({
  overflowX: 'auto',
  borderWidth: 'border.width',
  borderColor: 'color.border.accent.purple',
  borderStyle: 'solid',
  borderRadius: 'border.radius',
  padding: 'space.200',
  backgroundColor: 'elevation.surface.sunken',
});

function getColumns({ count }: { count: number }): TColumn[] {
  return Array.from({ length: count }, (_, columnIndex) => {
    const columnId = `column-${columnIndex}`;
    const items = Array.from({ length: 50 }, (_, itemIndex) => {
      return {
        id: `${columnId}::item-${itemIndex}`,
      };
    });
    return { id: columnId, items };
  });
}

const columnContainerStyles = xcss({
  width: 'min-content', // so we can have padding around the board
});

export function Board() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [columns] = useState<TColumn[]>(() => getColumns({ count: 8 }));

  const { autoScrollBoard } = useRequiredContext(BoardContext);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      autoScrollBoard({
        element,
      }),
      autoScrollWindowForElements(),
    );
  }, [autoScrollBoard]);

  return (
    <Box xcss={boardStyles} ref={ref}>
      <Flex gap="space.200" xcss={columnContainerStyles}>
        {columns.map(column => (
          <Column key={column.id} column={column} />
        ))}
      </Flex>
    </Box>
  );
}
