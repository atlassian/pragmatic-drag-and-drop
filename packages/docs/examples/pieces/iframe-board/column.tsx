import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import Heading from '@atlaskit/heading';
import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  dropTargetForElements,
  ElementDragPayload,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

import {
  getPeopleFromPosition,
  getPersonFromPosition,
  Person,
} from '../../data/people';

import { Card } from './card';
import {
  dropHandledExternallyLocalStorageKey,
  externalCardMediaType,
  getColumnDropTarget,
  isCard,
  isCardDropTarget,
  isColumnDropTarget,
} from './data';

const columnStyles = xcss({
  width: '250px',
  backgroundColor: 'elevation.surface.sunken',
  borderRadius: 'border.radius.300',
  transition: `background ${mediumDurationMs}ms ${easeInOut}`,
  position: 'relative',
});

const scrollContainerStyles = xcss({
  height: '100%',
  overflowY: 'auto',
});

const cardListStyles = xcss({
  boxSizing: 'border-box',
  minHeight: '100%',
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
  idle: xcss({
    cursor: 'grab',
  }),
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
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<State>(idle);

  useLayoutEffect(() => {
    const isInIframe: boolean =
      typeof window !== 'undefined' && window.parent !== window;

    if (!isInIframe) {
      return;
    }
    const frame = window.frameElement;
    if (!frame) {
      return;
    }

    frame.setAttribute('height', `${document.body.scrollHeight}`);

    const observer = new MutationObserver(() => {
      frame.setAttribute('height', `${document.body.scrollHeight}`);
    });

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
    const cardList = cardListRef.current;
    const scrollable = scrollableRef.current;
    invariant(cardList);
    invariant(column);
    invariant(header);
    invariant(scrollable);

    function isHomeColumn({ source }: { source: ElementDragPayload }): boolean {
      invariant(column);
      return isCard(source.data) && column.contains(source.element);
    }

    return combine(
      monitorForElements({
        canMonitor: isHomeColumn,
        onDrop({ source, location }) {
          const data = source.data;
          if (!isCard(data)) {
            return;
          }

          // dropped locally - don't do anything
          if (location.current.dropTargets.length) {
            return;
          }

          const cardId = localStorage.getItem(
            dropHandledExternallyLocalStorageKey,
          );
          if (!cardId) {
            return;
          }

          if (cardId !== data.cardId) {
            return;
          }

          const newItems = items.filter(item => item.userId !== data.cardId);
          setItems(newItems);
        },
      }),
      dropTargetForExternal({
        element: cardList,
        getDropEffect: () => 'move',
        canDrop: ({ source }) => source.types.includes(externalCardMediaType),
        getIsSticky: () => true,
        onDragEnter: () => setState(isCardOver),
        onDragLeave: () => setState(idle),
        onDrop: ({ source, location }) => {
          setState(idle);

          const cardId = source.getStringData(externalCardMediaType);
          if (!cardId) {
            return;
          }

          const position = Number(cardId.replace('id:', ''));
          invariant(
            Number.isInteger(position),
            `${position} was not an integer`,
          );
          const person = getPersonFromPosition({ position });

          const innerMost = location.current.dropTargets[0];
          // this should not happen
          if (!innerMost) {
            return;
          }

          const dropTargetData = innerMost.data;

          function update(newItems: Person[]) {
            setItems(newItems);

            // put a signal in local storage that this drag was handled
            localStorage.setItem(
              dropHandledExternallyLocalStorageKey,
              person.userId,
            );
          }

          // dropped on a card: swap as needed
          if (isCardDropTarget(dropTargetData)) {
            const closestEdge = extractClosestEdge(dropTargetData);
            // data setup issue
            invariant(closestEdge);

            const indexOfTarget = items.findIndex(
              item => item.userId === dropTargetData.cardId,
            );

            const newIndex =
              closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

            const newItems = Array.from(items);
            newItems.splice(newIndex, 0, person);

            update(newItems);
            return;
          }

          // dropped on the column: move item into last place
          if (isColumnDropTarget(dropTargetData)) {
            console.log('dropped on a column', 'add to last place');

            const newItems = [...items, person];

            update(newItems);
            return;
          }
        },
      }),
      dropTargetForElements({
        element: cardList,
        getData: () => getColumnDropTarget({ columnId }),
        canDrop: isHomeColumn,
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
          const startIndex = items.findIndex(
            item => item.userId === data.cardId,
          );

          const dropTargetData = innerMost.data;
          // dropped on a card: swap as needed
          if (isCardDropTarget(dropTargetData)) {
            const closestEdge = extractClosestEdge(dropTargetData);
            // data setup issue
            invariant(closestEdge);

            const indexOfTarget = items.findIndex(
              item => item.userId === dropTargetData.cardId,
            );
            invariant(
              startIndex !== -1 && indexOfTarget !== -1,
              'Could not find items',
            );

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
            console.log('dropped on a column', 'moving to last place');

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
      autoScrollForElements({
        element: scrollable,
        canScroll: isHomeColumn,
      }),
    );
  }, [items, columnId]);

  return (
    <Stack ref={columnRef} xcss={[columnStyles, stateStyles[state.type]]}>
      <Inline
        xcss={columnHeaderStyles}
        ref={headerRef}
        spread="space-between"
        alignBlock="center"
      >
        <Heading level="h300" as="span">
          {columnId}
        </Heading>
      </Inline>
      <Box xcss={scrollContainerStyles} ref={scrollableRef}>
        <Stack xcss={cardListStyles} ref={cardListRef} space="space.100">
          {items.map(item => (
            <Card item={item} key={item.userId} columnId={columnId} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
