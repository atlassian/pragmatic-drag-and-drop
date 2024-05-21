import { bindAll } from 'bind-event-listener';

import { type CleanupFn } from '../internal-types';
import { getBindingsForBrokenDrags } from '../util/detect-broken-drag';

function acceptDrop(event: DragEvent) {
  // if the event is already prevented the event we don't need to do anything
  if (event.defaultPrevented) {
    return;
  }
  // Using "move" as the drop effect as that uses the standard
  // cursor. Doing this so the user doesn't think they are dropping
  // on the page
  // Note: using "none" will not allow a "drop" to occur, so we are using "move"
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  // cancel the default browser behaviour
  // doing this will tell the browser that we have handled the drop
  event.preventDefault();
}

let unbindEvents: CleanupFn | null = null;
/**
 * Block drag operations outside of `@atlaskit/pragmatic-drag-and-drop`
 */
function start() {
  cleanup();
  unbindEvents = bindAll(
    window,
    [
      {
        type: 'dragover',
        listener: acceptDrop,
      },
      {
        type: 'dragenter',
        listener: acceptDrop,
      },
      {
        type: 'drop',
        listener(event) {
          // our lifecycle manager already prevents events, but just being super safe
          event.preventDefault();

          // not setting dropEffect, as `drop.dropEffect` has already been published to the user
          // (lifecycle-manager binds events in the capture phase)

          // we don't need to wait for "dragend", and "dragend" might not even happen,
          // such as when the draggable has been removed during a drag.
          cleanup();
        },
      },
      {
        type: 'dragend',
        listener: cleanup,
      },
      ...getBindingsForBrokenDrags({ onDragEnd: cleanup }),
    ],
    // being clear that these are added in the bubble phase
    { capture: false },
  );
}

function cleanup() {
  unbindEvents?.();
  unbindEvents = null;
}

/**
 * TODO: for next major, we could look at do the following:
 *
 * ```diff
 * - preventUnhandled.start();
 * - preventUnhandled.stop();
 * + const stop = preventUnhandled();
 * ```
 */

export const preventUnhandled = {
  start,
  stop: cleanup,
};
