/** @jsx jsx */
import { Fragment, type RefObject, useEffect, useRef } from 'react';

import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';

import { useFlashOnDrop } from '../../hooks/use-flash-on-drop';
import { type DragState, useSortableField } from '../../hooks/use-sortable-field';
import {
  subtaskGap,
  subtaskIconWidth,
  subtaskIdWidth,
  subtaskInlinePadding,
} from '../primitives/linear/constants';
import {
  Subtask,
  type SubtaskAppearance,
  SubtaskPreview,
  type SubtaskProps,
} from '../primitives/linear/subtask';
import { type DraggableSubtaskProps } from '../templates/_base';
import { LinearTemplate } from '../templates/linear';

const type = 'subtasks--linear-clone';

const draggableSubtaskStyles = css({ cursor: 'grab', position: 'relative' });

const stateToAppearanceMap: Record<DragState, SubtaskAppearance> = {
  idle: 'default',
  preview: 'overlay',
  dragging: 'disabled',
};

function DragPreview({
  subtaskRef,
  children,
  ...props
}: SubtaskProps & { subtaskRef: RefObject<HTMLElement> }) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previewElement = previewRef.current;
    invariant(previewElement);

    const fieldElement = subtaskRef.current;
    invariant(fieldElement);

    const initialFieldRect = fieldElement.getBoundingClientRect();

    function getAdjustment(location: DragLocationHistory) {
      const cursorAdjustment = {
        x: initialFieldRect.x - location.initial.input.clientX,
        y: initialFieldRect.y - location.initial.input.clientY,
      };

      const initialAdjustment = {
        x:
          cursorAdjustment.x +
          /**
           * Essentially calculating the offset of the status icon inside the
           * subtask.
           */
          subtaskInlinePadding +
          subtaskIconWidth +
          subtaskGap +
          subtaskIdWidth,
        y: cursorAdjustment.y + 4,
      };

      invariant(previewElement);
      const previewRect = previewElement.getBoundingClientRect();
      const initialOffset = {
        x: location.initial.input.clientX + initialAdjustment.x,
        y: location.initial.input.clientY + initialAdjustment.y,
      };

      let initialXFromPreview =
        location.initial.input.clientX -
        (initialOffset.x + previewRect.width / 2);

      if (Math.abs(initialXFromPreview) < previewRect.width / 2) {
        // If already inside the preview we don't need to shift it
        initialXFromPreview = 0;
      } else if (initialXFromPreview > 0) {
        // Adjust so it shifts to the edge not the centre
        initialXFromPreview -= previewRect.width / 2 - 8;
      } else if (initialXFromPreview < 0) {
        // Adjust so it shifts to the edge not the centre
        initialXFromPreview += previewRect.width / 2 - 8;
      }

      let initialYFromPreview =
        location.initial.input.clientY -
        (initialOffset.y + previewRect.height / 2);

      if (Math.abs(initialYFromPreview) < previewRect.height / 2) {
        // If already inside the preview we don't need to shift it
        initialYFromPreview = 0;
      } else if (initialYFromPreview > 0) {
        // Adjust so it shifts to the edge not the centre
        initialYFromPreview -= previewRect.height / 2 - 8;
      } else if (initialYFromPreview < 0) {
        // Adjust so it shifts to the edge not the centre
        initialYFromPreview += previewRect.height / 2 - 8;
      }

      const targetAdjustment = {
        x: initialAdjustment.x + initialXFromPreview,
        y: initialAdjustment.y + initialYFromPreview,
      };

      return { initialAdjustment, targetAdjustment };
    }

    let isFirstTick = true;

    return monitorForElements({
      onDrag({ location }) {
        const { current } = location;

        const offsetX = current.input.clientX;
        const offsetY = current.input.clientY;

        previewElement.style.setProperty('--offset-x', `${offsetX}px`);
        previewElement.style.setProperty('--offset-y', `${offsetY}px`);

        if (isFirstTick) {
          isFirstTick = false;

          const { initialAdjustment, targetAdjustment } =
            getAdjustment(location);

          Object.assign(previewElement.style, {
            transform: `translate(${offsetX + initialAdjustment.x}px, ${
              offsetY + initialAdjustment.y
            }px)`,
            opacity: 1,
          });

          requestAnimationFrame(() => {
            Object.assign(previewElement.style, {
              transform: `translate(calc(var(--offset-x) + ${targetAdjustment.x}px), calc(var(--offset-y) + ${targetAdjustment.y}px))`,
              transition: 'transform 33ms',
            });
          });
        }
      },
    });
  }, [subtaskRef]);

  return (
    <div
      ref={previewRef}
      style={{
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        position: 'fixed',
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        top: 0,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        left: 0,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        opacity: 0,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        pointerEvents: 'none',
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        zIndex: 999,
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
        willChange: 'transform',
      }}
    >
      <SubtaskPreview {...props}>{children}</SubtaskPreview>
    </div>
  );
}

function DraggableSubtask({ index, item }: DraggableSubtaskProps) {
  const { id, title } = item;

  const ref = useRef<HTMLDivElement>(null);

  const { dragState, isHovering, closestEdge } = useSortableField({
    id,
    index,
    type,
    ref,
    isSticky: false,
    shouldHideNativeDragPreview: true,
  });

  useFlashOnDrop({ ref, draggableId: id, type });

  return (
    <Fragment>
      <Subtask
        ref={ref}
        title={title}
        id={id}
        appearance={stateToAppearanceMap[dragState]}
        isHovering={isHovering && dragState === 'idle'}
        css={draggableSubtaskStyles}
      >
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
      </Subtask>
      {dragState === 'dragging' && (
        <DragPreview subtaskRef={ref} id={id} title={title} />
      )}
    </Fragment>
  );
}

export default function LinearTaskReordering() {
  return (
    <LinearTemplate instanceId={type} DraggableSubtask={DraggableSubtask} />
  );
}
