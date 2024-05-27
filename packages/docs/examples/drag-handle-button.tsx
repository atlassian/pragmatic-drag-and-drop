/** @jsx jsx */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

const itemStyles = css({
  display: 'flex',
  position: 'relative',
  ':hover': { '--trigger-opacity': 1 },
});

function Item({
  children,
  item,
  position,
}: {
  children: ReactNode;
  item: ItemData;
  position: 'first' | 'last' | 'middle' | 'only';
}) {
  const { reorderItem } = useContext(ExampleContext);

  const elementRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);

  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    invariant(elementRef.current);
    invariant(dragHandleRef.current);

    return combine(
      draggable({
        element: elementRef.current,
        dragHandle: dragHandleRef.current,
        getInitialData() {
          return { item };
        },
      }),
      dropTargetForElements({
        element: elementRef.current,
        getData({ input, source }) {
          return attachClosestEdge(
            { item },
            {
              element: source.element,
              input: input,
              allowedEdges: ['top', 'bottom'],
            },
          );
        },
        onDrag({ self }) {
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop() {
          setClosestEdge(null);
        },
      }),
    );
  }, [item]);

  const moveUp = useCallback(() => {
    reorderItem({ item, direction: 'up' });
  }, [item, reorderItem]);

  const moveDown = useCallback(() => {
    reorderItem({ item, direction: 'down' });
  }, [item, reorderItem]);

  const isFirstItem = position === 'first' || position === 'only';
  const isLastItem = position === 'last' || position === 'only';

  return (
    <div ref={elementRef} css={itemStyles}>
      <DropdownMenu
        trigger={({ triggerRef, ...triggerProps }) => (
          <DragHandleButton
            ref={mergeRefs([dragHandleRef, triggerRef])}
            {...triggerProps}
            label="Reorder"
          />
        )}
      >
        <DropdownItemGroup>
          <DropdownItem onClick={moveUp} isDisabled={isFirstItem}>
            Move up
          </DropdownItem>
          <DropdownItem onClick={moveDown} isDisabled={isLastItem}>
            Move down
          </DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
      <span>{children}</span>
      {closestEdge && <DropIndicator edge={closestEdge} />}
    </div>
  );
}

type ItemData = { label: string };

const initialData: ItemData[] = [
  { label: 'Apple' },
  { label: 'Banana' },
  { label: 'Carrot' },
];

type ReorderItem = (args: { item: ItemData; direction: 'up' | 'down' }) => void;

type ExampleContextProps = {
  reorderItem: ReorderItem;
};

const ExampleContext = createContext<ExampleContextProps>({
  reorderItem: () => {},
});

function getItemPosition({
  index,
  itemCount,
}: {
  index: number;
  itemCount: number;
}) {
  if (itemCount === 1) {
    return 'only';
  }

  if (index === 0) {
    return 'first';
  }

  if (index === itemCount - 1) {
    return 'last';
  }

  return 'middle';
}

const exampleContainerStyles = css({
  maxWidth: 240,
});

export default function DragHandleButtonExample() {
  const [data, setData] = useState(initialData);

  const reorderItem: ReorderItem = useCallback(
    ({ direction, item }) => {
      const startIndex = data.indexOf(item);
      const finishIndex = direction === 'up' ? startIndex - 1 : startIndex + 1;
      const newData = reorder({ list: data, startIndex, finishIndex });

      setData(newData);

      announce(
        `You've moved ${item.label} from position ${
          startIndex + 1
        } to position ${finishIndex + 1} of ${data.length}`,
      );
    },
    [data],
  );

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceItem = source.data.item;
        const targetItem = target.data.item;
        const closestEdgeOfTarget = extractClosestEdge(target.data);

        const startIndex = data.indexOf(sourceItem as ItemData);
        const indexOfTarget = data.indexOf(targetItem as ItemData);

        if (startIndex < 0 || indexOfTarget < 0) {
          return;
        }

        setData(data => {
          return reorderWithEdge({
            list: data,
            startIndex,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: 'vertical',
          });
        });
      },
    });
  }, [data]);

  return (
    <ExampleContext.Provider value={{ reorderItem }}>
      <div css={exampleContainerStyles}>
        {data.map((item, index) => (
          <Item
            key={item.label}
            item={item}
            position={getItemPosition({ index, itemCount: data.length })}
          >
            {item.label}
          </Item>
        ))}
      </div>
    </ExampleContext.Provider>
  );
}
