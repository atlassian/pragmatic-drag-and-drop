/* eslint-disable @atlaskit/design-system/no-nested-styles */
/** @jsx jsx */
import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '../src/entry-point/element/adapter';
import { dropTargetForExternal } from '../src/entry-point/external/adapter';
import { combine } from '../src/public-utils/combine';
import { reorder } from '../src/public-utils/reorder';

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
  userSelect: 'none',
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

const TypeContext = createContext<string>('unknown');

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
  const typeContext = useContext(TypeContext);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      draggable({
        element,
        getInitialData: () => ({ cardId, typeContext }),
        onGenerateDragPreview(args) {
          console.warn('onGenerateDragPreview');
        },
        onDragStart(args) {
          console.warn('onDragStart');
        },
        onDrop(args) {
          console.warn('onDrop');
        },
      }),
      dropTargetForElements({
        element,
        getData: () => ({ cardId }),
        canDrop: args => args.source.data.typeContext === typeContext,
        getIsSticky: () => isSticky,
        onDragStart: () => setState('is-over'),
        onDragEnter: () => setState('is-over'),
        onDragLeave: () => setState('idle'),
        onDrop: () => setState('idle'),
      }),
      dropTargetForExternal({
        element,
        getData: () => ({ cardId }),
        getIsSticky: () => isSticky,
        onDragEnter: () => setState('is-over'),
        onDragLeave: () => setState('idle'),
        onDrop: () => setState('idle'),
      }),
    );
  }, [cardId, typeContext, isSticky]);

  return (
    <div
      ref={ref}
      css={[
        cardStyles,
        interactiveStyles,
        state === 'is-over' ? isOverCardStyles : undefined,
      ]}
      data-testid={`${typeContext}-${cardId}`}
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

function DropTest() {
  const [cards, setCards] = useState<Card[]>(() => getCards());
  const [typeContext] = useState<string>('drop');
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.typeContext === typeContext,
      onDrop(args) {
        console.warn('told that the drag is over');
        const destination = args.location.current.dropTargets[0];
        if (!destination) {
          return;
        }
        const startIndex = cards.findIndex(
          card => card.id === args.source.data.cardId,
        );
        const finishIndex = cards.findIndex(
          card => card.id === destination.data.cardId,
        );

        setCards(reorder({ list: cards, startIndex, finishIndex }));
      },
    });
  }, [typeContext, cards]);

  return (
    <TypeContext.Provider value={typeContext}>
      <div css={stackStyles}>
        <h3>Drop test</h3>
        <strong>Swap items on drop</strong>
        <div css={[listStyles, interactiveStyles]}>
          {cards.map(card => {
            return <Card key={card.id} cardId={card.id} isSticky />;
          })}
        </div>
      </div>
    </TypeContext.Provider>
  );
}

function DragEndTest() {
  const [cards, setCards] = useState<Card[]>(() => getCards());
  const [typeContext] = useState<string>('dragend');

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.typeContext === typeContext,
      onDrop(args) {
        if (!args.location.current.dropTargets.length) {
          setCards(reorder({ list: cards, startIndex: 0, finishIndex: 1 }));
        }
      },
    });
  }, [typeContext, cards]);

  return (
    <TypeContext.Provider value={typeContext}>
      <div css={stackStyles}>
        <h3>Dragend test</h3>
        <strong>Swap first two cards on unsuccessful drag</strong>
        <div css={[listStyles, interactiveStyles]}>
          {cards.map(card => {
            return <Card key={card.id} cardId={card.id} isSticky={false} />;
          })}
        </div>
      </div>
    </TypeContext.Provider>
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
    return monitorForElements({
      onGenerateDragPreview: () => document.body.classList.add(isDraggingClass),
      onDrop: () => {
        document.body.classList.remove(isDraggingClass);
      },
    });
  }, []);

  useDebug();

  return (
    <div css={[exampleStyles, interactiveStyles]}>
      <GlobalStyles />
      <DropTest />
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
