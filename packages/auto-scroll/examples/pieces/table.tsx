import React, {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Box, xcss } from '@atlaskit/primitives';

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from '../../src/entry-point/element';

import { Card } from './card';

type TItem = { id: string };

const COLUMN_COUNT = 8;
const columns = new Array(COLUMN_COUNT).fill(null);

function getItems({ count }: { count: number }): TItem[] {
  return Array.from({ length: count }, (_, itemIndex) => ({
    id: `item-${itemIndex}`,
  }));
}

function Cell({
  isSticky,
  children,
}: PropsWithChildren<{ isSticky?: boolean }>) {
  return (
    <Box as="td" xcss={[cellStyles, isSticky && stickyStyles]}>
      {children}
    </Box>
  );
}

function Row({ item }: { item: TItem }) {
  return (
    <Box as="tr" xcss={rowStyles} testId={item.id}>
      {columns.map((_, index) =>
        index === 0 ? (
          <Cell isSticky>
            <Card item={item} />
          </Cell>
        ) : (
          <Cell key={index} />
        ),
      )}
    </Box>
  );
}

export function Table() {
  const ref = useRef<HTMLTableElement | null>(null);
  const [items] = useState<TItem[]>(() => getItems({ count: 20 }));

  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      monitorForElements({
        onDragStart() {
          setIsDragging(true);
        },
        onDrop() {
          setIsDragging(false);
        },
      }),
      autoScrollForElements({
        element,
        getAllowedAxis: () => 'vertical',
      }),
      autoScrollWindowForElements(),
    );
  }, []);

  return (
    <Box xcss={[wrapperStyles, isDragging && scrollLockStyles]} ref={ref}>
      <Box as="table" xcss={tableStyles}>
        <colgroup>
          {columns.map((_, index) => (
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
            <col key={index} style={{ width: '150px' }} />
          ))}
        </colgroup>
        <Box as="tbody">
          {items.map(item => (
            <Row key={item.id} item={item} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const cellStyles = xcss({
  padding: 'space.0',
  width: 'size.600',
  borderColor: 'color.border',
  borderWidth: 'border.width',
  borderStyle: 'solid',
});

const stickyStyles = xcss({
  position: 'sticky',
  left: '0',
  backgroundColor: 'elevation.surface',
});

const rowStyles = xcss({
  height: 'size.400',
  position: 'relative',
  borderColor: 'color.border',
  borderWidth: 'border.width',
  borderStyle: 'solid',
});

const wrapperStyles = xcss({
  overflow: 'auto',
  display: 'flex',
  maxHeight: '500px',
});

const scrollLockStyles = xcss({
  overflowX: 'hidden',
});

const tableStyles = xcss({
  tableLayout: 'fixed',
  borderWidth: 'border.width',
  borderColor: 'color.border',
  borderStyle: 'solid',
  borderRadius: 'border.radius',
  backgroundColor: 'elevation.surface.sunken',
});
