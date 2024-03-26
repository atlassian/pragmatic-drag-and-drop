import { RefObject, useCallback, useEffect } from 'react';

import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { mediumDurationMs } from '@atlaskit/motion';
import { token } from '@atlaskit/tokens';

export function useFlashOnDrop({
  ref,
  draggableId,
  type,
}: {
  ref: RefObject<HTMLElement>;
  draggableId: string;
  type: string;
}) {
  /**
   * Flash makes it obvious what/where you dropped. Inspired by Linear.
   */
  const flashIn = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.animate(
      [{ background: token('color.background.selected', 'transparent') }, {}],
      {
        duration: mediumDurationMs,
        iterations: 1,
      },
    );
  }, [ref]);

  useEffect(() => {
    return bind(window, {
      type: 'afterdrop',
      listener(event) {
        invariant(event instanceof CustomEvent);
        if (event.detail.id !== draggableId || event.detail.type !== type) {
          return;
        }
        flashIn();
      },
    });
  }, [flashIn, draggableId, type]);
}
