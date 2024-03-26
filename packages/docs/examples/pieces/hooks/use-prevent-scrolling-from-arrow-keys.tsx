import { useEffect } from 'react';

import { bind } from 'bind-event-listener';

/**
 * Cancels keydown events for arrow keys.
 *
 * Used as a patch to fix dropdown menu behavior, which allows scrolling
 * while navigating a dropdown menu.
 */
export function usePreventScrollingFromArrowKeys({
  shouldPreventScrolling,
}: {
  shouldPreventScrolling: boolean;
}) {
  useEffect(() => {
    if (!shouldPreventScrolling) {
      return;
    }

    return bind(window, {
      type: 'keydown',
      listener(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
        }
      },
    });
  }, [shouldPreventScrolling]);
}
