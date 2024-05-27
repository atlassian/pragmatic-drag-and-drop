/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { Fragment, type ReactNode, useCallback, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import ReactDOM from 'react-dom';

import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { token } from '@atlaskit/tokens';

import { useFlashOnDrop } from '../../hooks/use-flash-on-drop';
import { useSortableField } from '../../hooks/use-sortable-field';
import { Field, FieldLabel } from '../index';
import PinnedFieldsAtlassianTemplate, {
  type DraggableFieldProps,
} from '../templates/atlassian';

/**
 * Enhancements are WIP and experimental
 */
const type = 'enhanced--drag-handle';

const draggableFieldPreviewStyles = css({
  background: token('elevation.surface.overlay'),
  boxShadow: token('elevation.shadow.overlay'),
  borderRadius: 3,
  padding: '4px 8px',
});

function DraggableFieldPreview({ children }: { children: ReactNode }) {
  return (
    <div css={draggableFieldPreviewStyles}>
      <FieldLabel>{children}</FieldLabel>
    </div>
  );
}

const draggableFieldStyles = {
  idle: css({}),
  preview: css({}),
  dragging: css({}),
};

function DraggableField({
  index,
  item,
  data,
  reorderItem,
}: DraggableFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [dragHandle, setDragHandle] = useState<HTMLElement | null>(null);

  const { dragState, closestEdge } = useSortableField({
    id: item.id,
    index,
    type,
    ref,
    dragHandle,
    onGenerateDragPreview({ nativeSetDragImage }) {
      return setCustomNativeDragPreview({
        nativeSetDragImage,
        getOffset: pointerOutsideOfPreview({
          x: '16px',
          y: '8px',
        }),
        render({ container }) {
          ReactDOM.render(
            <DraggableFieldPreview>{item.label}</DraggableFieldPreview>,
            container,
          );
          return () => {
            ReactDOM.unmountComponentAtNode(container);
          };
        },
      });
    },
  });

  useFlashOnDrop({ ref, draggableId: item.id, type });

  const moveUp = useCallback(() => {
    reorderItem({ id: item.id, action: 'up' });
  }, [item.id, reorderItem]);

  const moveDown = useCallback(() => {
    reorderItem({ id: item.id, action: 'down' });
  }, [item.id, reorderItem]);

  const isMoveUpDisabled = index === 0;
  const isMoveDownDisabled = index === data.length - 1;

  return (
    <Field
      ref={ref}
      isDisabled={dragState === 'dragging'}
      closestEdge={closestEdge}
      css={draggableFieldStyles[dragState]}
      label={
        <Fragment>
          <span
            style={{
              marginLeft: -4,
            }}
          >
            <DropdownMenu
              trigger={({ triggerRef, ...triggerProps }) => (
                <DragHandleButton
                  ref={mergeRefs([setDragHandle, triggerRef])}
                  {...triggerProps}
                  label="reorder"
                  appearance="subtle"
                />
              )}
            >
              <DropdownItemGroup>
                <DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
                  Move up
                </DropdownItem>
                <DropdownItem
                  onClick={moveDown}
                  isDisabled={isMoveDownDisabled}
                >
                  Move down
                </DropdownItem>
              </DropdownItemGroup>
            </DropdownMenu>
          </span>
          {item.label}
        </Fragment>
      }
    >
      {item.content}
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
    </Field>
  );
}

export default function PinnedFieldsPrototype() {
  return (
    <PinnedFieldsAtlassianTemplate
      instanceId={type}
      DraggableField={DraggableField}
    />
  );
}
