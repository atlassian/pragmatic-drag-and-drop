/* eslint-disable @atlaskit/design-system/no-nested-styles */
/** @jsx jsx */
import { useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { combine } from '../src/entry-point/combine';
import {
  dropTargetForExternal,
  monitorForExternal,
} from '../src/entry-point/external/adapter';
import { containsText } from '../src/entry-point/external/text';
import { reorder } from '../src/entry-point/reorder';

import { fallbackColor } from './_util/fallback';
import { GlobalStyles } from './_util/global-styles';

// I was hoping to use this example for browser testing,
// but puppeteer does not replicate the browser bug.
// I think it best to keep this example around as it makes it
// easy to debug the browser bug and the fix

const isDraggingClass = 'is-dragging';

const interactiveStyles = css({
  position: 'relative',

  [`body:not(.${isDraggingClass}) &::before`]: {
    content: '""',
    position: 'absolute',
    // zIndex: ,
    top: 0,
    left: 0,
    padding: 'var(--grid)',
  },
  [`body:not(.${isDraggingClass}) &:hover::before`]: {
    content: '":hover"',
    background: token('color.background.accent.green.subtler', 'transparent'),
  },
  [`body:not(.${isDraggingClass}) &:active::before`]: {
    content: '":active"',
    background: token('color.background.accent.blue.subtler', 'transparent'),
  },
});

const cardStyles = css({
  boxShadow: token('elevation.shadow.raised', fallbackColor),
  background: token('elevation.surface.raised', fallbackColor),
  justifyContent: 'center',
  borderRadius: 'var(--border-radius)',
  padding: 'var(--grid)',
  textAlign: 'center',

  position: 'relative',
});

const listStyles = css({
  display: 'flex',
  alignItems: 'stretch',
  flexDirection: 'column',
  gap: 'calc(var(--grid)* 2)',
  width: 240,
  margin: '0 auto',
  padding: 'calc(var(--grid) * 6)',
  background: token('elevation.surface.sunken', '#F7F8F9'),

  position: 'relative',
});

const stackStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--grid)',

  '> *': {
    margin: 0,
  },
});

const isOverCardStyles = css({
  background: token('color.interaction.hovered', 'transparent'),
});

function Card({ cardId, isSticky }: { cardId: string; isSticky: boolean }) {
  const [counts, setCounts] = useState<{
    click: number;
    enter: number;
    leave: number;
  }>({
    click: 0,
    enter: 0,
    leave: 0,
  });
  const [state, setState] = useState<'idle' | 'is-over'>('idle');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      dropTargetForExternal({
        canDrop: containsText,
        element,
        getData: () => ({ cardId }),
        getIsSticky: () => isSticky,
        onDragEnter: () => setState('is-over'),
        onDragLeave: () => setState('idle'),
        onDrop: () => setState('idle'),
      }),
    );
  }, [cardId, isSticky]);

  return (
    <div
      ref={ref}
      css={[
        cardStyles,
        interactiveStyles,
        state === 'is-over' ? isOverCardStyles : undefined,
      ]}
      onMouseEnter={() => {
        // if (!document.body.classList.contains(isDraggingClass)) {
        console.log('dragging: enter into', cardId);
        setCounts(current => ({ ...current, enter: current.enter + 1 }));
        // }
      }}
      onMouseLeave={() => {
        setCounts(current => ({ ...current, leave: current.leave + 1 }));
      }}
      onClick={() =>
        setCounts(current => ({ ...current, click: current.click + 1 }))
      }
    >
      {cardId}{' '}
      <small>
        click {counts.click} enter {counts.enter} leave {counts.leave}
      </small>
    </div>
  );
}

type Card = {
  id: string;
};
function getCards() {
  return Array.from({ length: 30 }, (_, index) => ({
    id: `card-${index}`,
  }));
}

function DragEndTest() {
  const [cards, setCards] = useState<Card[]>(() => getCards());

  useEffect(() => {
    return monitorForExternal({
      canMonitor: containsText,
      onDrop(args) {
        console.warn('reordering');
        if (!args.location.current.dropTargets.length) {
          setCards(reorder({ list: cards, startIndex: 0, finishIndex: 1 }));
        }
      },
    });
  }, [cards]);

  return (
    <div css={stackStyles}>
      <h3>Dragend test (native)</h3>
      <strong>Swap first two cards on unsuccessful drag</strong>
      <div css={[listStyles, interactiveStyles]}>
        {cards.map(card => {
          return <Card key={card.id} cardId={card.id} isSticky={false} />;
        })}
      </div>
    </div>
  );
}

const exampleStyles = css({
  display: 'flex',
  flexDirection: 'row',
  textAlign: 'center',
  justifyContent: 'center',
  gap: 'calc(var(--grid) * 2)',
});

export default function Example() {
  useEffect(() => {
    return monitorForExternal({
      canMonitor: containsText,
      onDragStart: () => document.body.classList.add(isDraggingClass),
      onDrop: () => {
        document.body.classList.remove(isDraggingClass);
      },
    });
  }, []);

  useDebug();

  return (
    <div css={[exampleStyles, interactiveStyles]}>
      <GlobalStyles />
      <DragEndTest />
    </div>
  );
}

function useDebug() {
  useEffect(() => {
    const events = [
      // 'mousemove',
      'mouseup',
      'mousedown',
      'mouseover',
      'mouseout',
      'mouseleave',
      'mouseenter',
      'click',
      'focusin',
      'focusout',
      'drop',
      'dragend',
      'drag',
      'dragleave',
    ] as const;

    return bindAll(
      window,
      events.map(v => ({
        type: v,
        listener: (event: Event) => {
          console.log('event:', event.type, {
            target: event.target,
            relatedTarget: (event as MouseEvent).relatedTarget,
            clientX: (event as MouseEvent).clientX,
          });
        },
        options: { capture: true },
      })),
    );
  }, []);
}
