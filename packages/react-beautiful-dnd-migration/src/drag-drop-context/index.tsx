import React, {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  BeforeCapture,
  DragDropContextProps,
  DraggableLocation,
  DragStart,
  DragUpdate,
  DroppableId,
  DroppableMode,
  DropResult,
  MovementMode,
} from 'react-beautiful-dnd';

import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';

import { getDraggableDimensions } from '../hooks/use-captured-dimensions';
import { useCleanupFn } from '../hooks/use-cleanup-fn';
import { attributes, getAttribute } from '../utils/attributes';
import { findDragHandle } from '../utils/find-drag-handle';
import { getClosestPositionedElement } from '../utils/get-closest-positioned-element';

import { cancelPointerDrag } from './cancel-drag';
import { isSameLocation } from './draggable-location';
import {
  type DroppableRegistryEntry,
  useDroppableRegistry,
} from './droppable-registry';
import { ErrorBoundary } from './error-boundary';
import { getActualDestination } from './get-destination';
import useHiddenTextElement from './hooks/use-hidden-text-element';
import { useKeyboardControls } from './hooks/use-keyboard-controls';
import { usePointerControls } from './hooks/use-pointer-controls';
import useStyleMarshal from './hooks/use-style-marshal';
import { DragDropContextProvider } from './internal-context';
import { LifecycleContextProvider, useLifecycle } from './lifecycle-context';
import { rbdInvariant } from './rbd-invariant';
import {
  defaultDragHandleUsageInstructions,
  getProvided,
} from './screen-reader';
import type { DragController, DragState } from './types';
import { useScheduler } from './use-scheduler';

/**
 * The instance count is used for selectors when querying the document.
 *
 * Ideally, in the future, this can be removed completely.
 */
let instanceCount = 0;

export function resetServerContext() {
  instanceCount = 0;
}

function getContextId() {
  return `${instanceCount++}`;
}

function getOffset(args: { element: HTMLElement; mode: DroppableMode }) {
  const offsetElement = getClosestPositionedElement(args);
  return {
    top: offsetElement.offsetTop,
    left: offsetElement.offsetLeft,
  };
}

export function DragDropContext({
  children,
  dragHandleUsageInstructions = defaultDragHandleUsageInstructions,
  nonce,
  onBeforeCapture,
  onBeforeDragStart,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: DragDropContextProps & { children?: ReactNode }): ReactElement {
  const [contextId] = useState<string>(getContextId);
  useHiddenTextElement({ contextId, text: dragHandleUsageInstructions });

  const lifecycle = useLifecycle();

  const { schedule, flush } = useScheduler();

  const dragStateRef = useRef<DragState>({ isDragging: false });
  const getDragState = useCallback(() => {
    return dragStateRef.current;
  }, []);

  const droppableRegistry = useDroppableRegistry();

  const getClosestEnabledDraggableLocation = useCallback(
    ({
      droppableId,
    }: {
      droppableId: DroppableId;
    }): DraggableLocation | null => {
      let droppable = droppableRegistry.getEntry({
        droppableId,
      });

      while (droppable !== null && droppable.isDropDisabled) {
        const { parentDroppableId } = droppable;

        droppable = parentDroppableId
          ? droppableRegistry.getEntry({
              droppableId: parentDroppableId,
            })
          : null;
      }

      if (droppable === null) {
        return null;
      }

      return { droppableId: droppable.droppableId, index: 0 };
    },
    [droppableRegistry],
  );

  useEffect(() => {
    /**
     * If there is a drag when the context unmounts, cancel it.
     */
    return () => {
      const { isDragging } = getDragState();
      if (isDragging) {
        cancelPointerDrag();
      }
    };
  }, [getDragState]);

  const updateDrag = useCallback(
    ({
      targetLocation,
      isImmediate = false,
    }: {
      targetLocation: DraggableLocation | null;
      isImmediate?: boolean;
    }) => {
      if (!dragStateRef.current.isDragging) {
        /**
         * If there is no ongoing drag, then don't do anything.
         *
         * This should never occur, but treating it as a noop is more
         * reasonable than an invariant.
         */
        return;
      }

      const { prevDestination, draggableId, type, sourceLocation } =
        dragStateRef.current;

      /**
       * Computes where it would actually move to
       */
      const nextDestination = getActualDestination({
        start: sourceLocation,
        target: targetLocation,
      });

      if (isSameLocation(prevDestination, nextDestination)) {
        return;
      }

      Object.assign(dragStateRef.current, {
        prevDestination: nextDestination,
        sourceLocation,
        targetLocation,
      });

      const update: DragUpdate = {
        mode: dragStateRef.current.mode,
        draggableId,
        type,
        source: sourceLocation,
        destination: nextDestination,
        combine: null, // not supported by migration layer
      };

      const droppable = targetLocation
        ? droppableRegistry.getEntry({
            droppableId: targetLocation.droppableId,
          })
        : null;

      /**
       * This event exists solely to ensure that the drop indicator updates
       * before the drag preview.
       */
      lifecycle.dispatch('onPrePendingDragUpdate', { update, targetLocation });
      lifecycle.dispatch('onPendingDragUpdate', {
        update,
        targetLocation,
        droppable,
      });

      function dispatchConsumerLifecycleEvent() {
        const { provided, getMessage } = getProvided('onDragUpdate', update);
        onDragUpdate?.(update, provided);
        announce(getMessage());
      }

      if (isImmediate) {
        dispatchConsumerLifecycleEvent();
      } else {
        schedule(dispatchConsumerLifecycleEvent);
      }
    },
    [droppableRegistry, lifecycle, onDragUpdate, schedule],
  );

  const startDrag = useCallback(
    ({
      draggableId,
      type,
      getSourceLocation,
      sourceElement,
      mode,
    }: {
      draggableId: string;
      type: string;
      getSourceLocation(): DraggableLocation;
      sourceElement: HTMLElement;
      mode: MovementMode;
    }) => {
      if (dragStateRef.current.isDragging) {
        /**
         * If there is already an ongoing drag, then don't do anything.
         *
         * This should never occur, but treating it as a noop is more
         * reasonable than an invariant.
         */
        return;
      }

      const before: BeforeCapture = {
        draggableId,
        mode,
      };

      // This is called in `onDragStart` rather than `onGenerateDragPreview`
      // to avoid a browser bug. Some DOM manipulations can cancel
      // the drag if they happen early in the drag.
      // <https://bugs.chromium.org/p/chromium/issues/detail?id=674882>
      onBeforeCapture?.(before);

      const start: DragStart = {
        mode,
        draggableId,
        type,
        source: getSourceLocation(),
      };

      /**
       * If the active element is a drag handle, then
       * we want to restore focus to it after the drag.
       *
       * This matches the behavior of `react-beautiful-dnd`.
       */
      const { activeElement } = document;
      const dragHandleDraggableId =
        activeElement instanceof HTMLElement &&
        activeElement.hasAttribute(attributes.dragHandle.draggableId)
          ? getAttribute(activeElement, attributes.dragHandle.draggableId)
          : null;

      const { droppableId } = start.source;
      const droppable = droppableRegistry.getEntry({ droppableId });
      rbdInvariant(
        droppable,
        `should have entry for droppable '${droppableId}'`,
      );

      dragStateRef.current = {
        isDragging: true,
        mode,
        draggableDimensions: getDraggableDimensions(sourceElement),
        restoreFocusTo: dragHandleDraggableId,
        draggableId,
        type,
        prevDestination: start.source,
        sourceLocation: start.source,
        targetLocation: start.source,
        draggableInitialOffsetInSourceDroppable: getOffset({
          element: sourceElement,
          mode: droppable.mode,
        }),
      };

      onBeforeDragStart?.(start);

      /**
       * This is used to signal to <Draggable> and <Droppable> elements
       * to update their state.
       *
       * This must be synchronous so that they have updated their state
       * by the time that `DragStart` is published.
       */
      lifecycle.dispatch('onPendingDragStart', { start, droppable });

      // rbd's `onDragStart` is called in the next event loop (via `setTimeout`)
      //
      // We can safely assume that the React state updates have occurred by
      // now, and that the updated `snapshot` has been provided.
      // <https://twitter.com/alexandereardon/status/1585784101885263872>
      schedule(() => {
        const start: DragStart = {
          mode,
          draggableId,
          type,
          source: getSourceLocation(),
        };

        const { provided, getMessage } = getProvided('onDragStart', start);
        onDragStart?.(start, provided);
        announce(getMessage());

        /**
         * If the droppable is initially disabled, then we publish an
         * immediate `DragUpdate` with a new non-disabled destination.
         *
         * This is typically `destination === null` but can be a parent
         * droppable if there are nested droppables.
         *
         * `react-beautiful-dnd` does this for mouse drags,
         * but not for keyboard drags. This is likely a bug, and the migration
         * layer will publish an update for all types of drags.
         *
         * This is scheduled so that state changes that occurred in the
         * rbd `onDragStart` will have taken effect. That is,
         * a synchronous `setIsDropDisabled(true)` call in the consumer's
         * `onDragStart` should result in an immediate update here.
         */
        schedule(() => {
          const { droppableId } = start.source;

          const droppable = droppableRegistry.getEntry({ droppableId });

          if (droppable?.isDropDisabled) {
            const targetLocation = getClosestEnabledDraggableLocation({
              droppableId,
            });
            updateDrag({ targetLocation, isImmediate: true });
          }
        });
      });
    },
    [
      droppableRegistry,
      getClosestEnabledDraggableLocation,
      lifecycle,
      onBeforeCapture,
      onBeforeDragStart,
      onDragStart,
      schedule,
      updateDrag,
    ],
  );

  const keyboardCleanupManager = useCleanupFn();

  const stopDrag: DragController['stopDrag'] = useCallback(
    ({ reason }) => {
      if (!dragStateRef.current.isDragging) {
        /**
         * If there is no ongoing drag, then don't do anything.
         *
         * This should never occur, but treating it as a noop is more
         * reasonable than an invariant.
         */
        return;
      }

      keyboardCleanupManager.runCleanupFn();

      /**
       * If this is a cancel, then an update to a null
       * destination will be made. (Unless it is already null)
       *
       * This is different to `react-beautiful-dnd` and exists
       * to standardize behavior between mouse and keyboard drags.
       *
       * This is required because of a behavior in native drag and
       * drop, where a `dragend` will fire exit events on every
       * drop target you are over. This results in an unavoidable
       * null destination update for mouse drags.
       */
      if (reason === 'CANCEL') {
        updateDrag({ targetLocation: null });
      }

      const {
        mode,
        restoreFocusTo,
        sourceLocation,
        targetLocation,
        type,
        draggableId,
      } = dragStateRef.current;

      dragStateRef.current = { isDragging: false };

      flush();

      const destination = getActualDestination({
        start: sourceLocation,
        target: targetLocation,
      });

      const result: DropResult = {
        // We are saying all null destination drops count as a CANCEL
        reason: destination === null ? 'CANCEL' : 'DROP',
        type,
        source: sourceLocation,
        destination,
        mode,
        draggableId,
        combine: null, // not supported by migration layer
      };

      /**
       * Tells <Draggable> instances to cleanup.
       */
      lifecycle.dispatch('onBeforeDragEnd', { draggableId });

      const { provided, getMessage } = getProvided('onDragEnd', result);
      onDragEnd(result, provided);
      announce(getMessage());

      if (restoreFocusTo) {
        /**
         * The `requestAnimationFrame` matches `react-beautiful-dnd`.
         *
         * It is required to wait for React state updates to have taken effect.
         * Otherwise we might try to focus an element that no longer exists.
         */
        requestAnimationFrame(() => {
          const dragHandle = findDragHandle({ contextId, draggableId });
          if (!dragHandle) {
            return;
          }
          dragHandle.focus();
        });
      }
    },
    [
      contextId,
      flush,
      keyboardCleanupManager,
      lifecycle,
      onDragEnd,
      updateDrag,
    ],
  );

  const dragController: DragController = useMemo(() => {
    return {
      getDragState,
      startDrag,
      updateDrag,
      stopDrag,
    };
  }, [getDragState, startDrag, stopDrag, updateDrag]);

  usePointerControls({ dragController, contextId });

  const { startKeyboardDrag } = useKeyboardControls({
    dragController,
    droppableRegistry,
    contextId,
    setKeyboardCleanupFn: keyboardCleanupManager.setCleanupFn,
  });

  /**
   * If a droppable becomes disabled during a drag, then a new destination
   * should be found and published in a `DragUpdate`.
   */
  const onDroppableUpdate = useCallback(
    (entry: DroppableRegistryEntry) => {
      const dragState = dragStateRef.current;

      if (!dragState.isDragging) {
        return;
      }

      if (!entry.isDropDisabled) {
        return;
      }

      if (entry.droppableId !== dragState.targetLocation?.droppableId) {
        return;
      }

      const targetLocation = getClosestEnabledDraggableLocation({
        droppableId: entry.droppableId,
      });
      updateDrag({ targetLocation });
    },
    [getClosestEnabledDraggableLocation, updateDrag],
  );

  droppableRegistry.setUpdateListener(onDroppableUpdate);

  useStyleMarshal({ contextId, nonce });

  return (
    <ErrorBoundary contextId={contextId} dragController={dragController}>
      <LifecycleContextProvider lifecycle={lifecycle}>
        <DragDropContextProvider
          contextId={contextId}
          getDragState={getDragState}
          startKeyboardDrag={startKeyboardDrag}
          droppableRegistry={droppableRegistry}
        >
          {children}
        </DragDropContextProvider>
      </LifecycleContextProvider>
    </ErrorBoundary>
  );
}
