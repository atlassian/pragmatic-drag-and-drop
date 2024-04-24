import React, {
  Fragment,
  ReactNode,
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import EditorMoreIcon from '@atlaskit/icon/glyph/editor/more';
import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Box, Grid, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

const containerStyles = xcss({
  maxWidth: '400px',
  padding: 'space.100',
  gap: 'space.100',
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderColor: 'color.border',
});

const listItemStyles = xcss({
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderColor: 'color.border',
  padding: 'space.100',
  cursor: 'grab',
  borderRadius: 'border.radius',
  backgroundColor: 'elevation.surface',
});

const previewStyles = xcss({
  borderWidth: 'border.width',
  borderStyle: 'solid',
  borderColor: 'color.border',
  padding: 'space.100',
  borderRadius: 'border.radius',
});

function Preview() {
  return <Box xcss={previewStyles}>Item preview</Box>;
}

const draggingStyles = xcss({
  opacity: 0.4,
});

type DraggableState =
  | {
      type: 'idle';
    }
  | {
      type: 'preview';
      container: HTMLElement;
    }
  | {
      type: 'dragging';
    };

function ListItem({
  start,
  content,
  end,
}: {
  start: ReactNode;
  content: ReactNode;
  end?: ReactNode;
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<DraggableState>({ type: 'idle' });

  useEffect(() => {
    const element = draggableRef.current;
    invariant(element);
    return draggable({
      element,
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({
            x: token('space.200', '16px'),
            y: token('space.100', '8px'),
          }),
          nativeSetDragImage,
          render({ container }) {
            setState({ type: 'preview', container });
            return () => setState({ type: 'dragging' });
          },
        });
      },
      onDrop() {
        setState({ type: 'idle' });
      },
    });
  }, []);

  return (
    <Fragment>
      <Grid
        ref={draggableRef}
        alignItems="center"
        columnGap="space.100"
        templateColumns="auto 1fr auto"
        xcss={[
          listItemStyles,
          state.type === 'dragging' ? draggingStyles : undefined,
        ]}
      >
        {start}
        <Box>{content}</Box>
        {end}
      </Grid>
      {state.type === 'preview'
        ? createPortal(<Preview />, state.container)
        : null}
    </Fragment>
  );
}

const dragHandleIconStyles = xcss({
  cursor: 'grab',
});

export default function ListExample() {
  return (
    <Stack xcss={containerStyles}>
      <ListItem
        start={
          <Stack xcss={dragHandleIconStyles}>
            <DragHandlerIcon label="Drag list item" />
          </Stack>
        }
        content="Using a more menu"
        end={
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <IconButton
                ref={triggerRef as Ref<HTMLButtonElement>}
                label="More actions"
                icon={EditorMoreIcon}
                spacing="compact"
                {...triggerProps}
              />
            )}
          >
            <DropdownItemGroup>
              <DropdownItem>Move to top</DropdownItem>
              <DropdownItem>Move up</DropdownItem>
              <DropdownItem>Move down</DropdownItem>
              <DropdownItem>Move to bottom</DropdownItem>
            </DropdownItemGroup>
            <DropdownItemGroup hasSeparator>
              <DropdownItem>Add label</DropdownItem>
              <DropdownItem>Change parent</DropdownItem>
            </DropdownItemGroup>
            <DropdownItemGroup hasSeparator>
              <DropdownItem>Remove from sprint</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>
        }
      />
      <ListItem
        start={
          <Stack xcss={dragHandleIconStyles}>
            <DragHandlerIcon label="Drag list item" />
          </Stack>
        }
        content={
          <span>
            Using a more menu <em>(grouped move items)</em>
          </span>
        }
        end={
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <IconButton
                ref={triggerRef as Ref<HTMLButtonElement>}
                label="More actions"
                icon={EditorMoreIcon}
                spacing="compact"
                {...triggerProps}
              />
            )}
          >
            <DropdownItemGroup>
              <DropdownMenu
                placement="right-start"
                // shouldRenderToParent
                trigger={({ triggerRef, ...triggerProps }) => (
                  <DropdownItem
                    {...triggerProps}
                    ref={triggerRef}
                    elemAfter={
                      <ChevronRightIcon
                        primaryColor={token('color.icon.subtle', '')}
                        label=""
                      />
                    }
                  >
                    <span>Move</span>
                  </DropdownItem>
                )}
              >
                <DropdownItemGroup>
                  <DropdownItem>Move to top</DropdownItem>
                  <DropdownItem>Move up</DropdownItem>
                  <DropdownItem>Move down</DropdownItem>
                  <DropdownItem>Move to bottom</DropdownItem>
                </DropdownItemGroup>
              </DropdownMenu>
            </DropdownItemGroup>
            <DropdownItemGroup hasSeparator>
              <DropdownItem>Add label</DropdownItem>
              <DropdownItem>Change parent</DropdownItem>
            </DropdownItemGroup>
            <DropdownItemGroup hasSeparator>
              <DropdownItem>Remove from sprint</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>
        }
      />
      <ListItem
        start={
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <DragHandleButton
                ref={triggerRef as Ref<HTMLButtonElement>}
                {...triggerProps}
                label={`Reorder item`}
              />
            )}
          >
            <DropdownItemGroup>
              <DropdownItem>Move to top</DropdownItem>
              <DropdownItem>Move up</DropdownItem>
              <DropdownItem>Move down</DropdownItem>
              <DropdownItem>Move to bottom</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>
        }
        content="Using a drag handle menu"
      />
    </Stack>
  );
}
