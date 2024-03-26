export function getBindingsForBrokenDrags({
  onDragEnd,
}: {
  onDragEnd: () => void;
}) {
  return [
    // ## Detecting drag ending for removed draggables
    //
    // If a draggable element is removed during a drag and the user drops:
    // 1. if over a valid drop target: we get a "drop" event to know the drag is finished
    // 2. if not over a valid drop target (or cancelled): we get nothing
    // The "dragend" event will not fire on the source draggable if it has been
    // removed from the DOM.
    // So we need to figure out if a drag operation has finished by looking at other events
    // We can do this by looking at other events

    // ### First detection: "pointermove" events

    // 1. "pointermove" events cannot fire during a drag and drop operation
    // according to the spec. So if we get a "pointermove" it means that
    // the drag and drop operations has finished. So if we get a "pointermove"
    // we know that the drag is over
    // 2. 🦊😤 Drag and drop operations are _supposed_ to suppress
    // other pointer events. However, firefox will allow a few
    // pointer event to get through after a drag starts.
    // The most I've seen is 3
    {
      type: 'pointermove',
      listener: (() => {
        let callCount: number = 0;
        return function listener() {
          // Using 20 as it is far bigger than the most observed (3)
          if (callCount < 20) {
            callCount++;
            return;
          }
          onDragEnd();
        };
      })(),
    },

    // ### Second detection: "pointerdown" events

    // If we receive this event then we know that a drag operation has finished
    // and potentially another one is about to start.
    // Note: `pointerdown` fires on all browsers / platforms before "dragstart"
    {
      type: 'pointerdown',
      listener: onDragEnd,
    },
  ] as const;
}
