/** @jsx jsx */
import { memo } from 'react';

import { css, jsx } from '@emotion/react';

import { easeInOut } from '@atlaskit/motion/curves';
import { mediumDurationMs } from '@atlaskit/motion/durations';
import { token } from '@atlaskit/tokens';

import type { ColumnType } from '../data/tasks';

import { Card } from './card';
import { useDependency } from './example-wrapper';

const columnStyles = css({
  display: 'flex',
  width: 250,
  flexDirection: 'column',
  background: token('elevation.surface.sunken', '#F7F8F9'),
  borderRadius: 'calc(var(--grid) * 2)',
  position: 'relative',
  overflow: 'hidden',
  marginRight: 'var(--column-gap)',
});

const columnDraggingStyles = css({
  boxShadow: token(
    'elevation.shadow.overlay',
    '0px 8px 12px rgba(9, 30, 66, 0.15),0px 0px 1px rgba(9, 30, 66, 0.31)',
  ),
});

const scrollContainerStyles = css({
  height: '100%',
  overflowY: 'auto',
});

const cardListStyles = css({
  display: 'flex',
  boxSizing: 'border-box',
  minHeight: '100%',
  padding: 'var(--grid)',
  flexDirection: 'column',
  transition: `background ${mediumDurationMs}ms ${easeInOut}`,
});

const columnHeaderStyles = css({
  display: 'flex',
  padding: 'calc(var(--grid) * 2) calc(var(--grid) * 2) calc(var(--grid) * 1)',
  justifyContent: 'space-between',
  flexDirection: 'row',
  color: token('color.text.subtlest', '#626F86'),
  userSelect: 'none',
});

const columnHeaderIdStyles = css({
  color: token('color.text.disabled', '#091E424F'),
  fontSize: '10px',
});

const isDraggingOverColumnStyles = css({
  background: token('color.background.selected.hovered', '#CCE0FF'),
});

type ColumnProps = {
  column: ColumnType;
  droppableId: string;
  index: number;
};

export const Column = memo(({ column, droppableId, index }: ColumnProps) => {
  const { Draggable, Droppable } = useDependency();

  const columnId = column.columnId;

  return (
    <Draggable draggableId={`draggable-${column.columnId}`} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            css={[columnStyles, snapshot.isDragging && columnDraggingStyles]}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div
              css={columnHeaderStyles}
              data-testid={`column-${columnId}--header`}
              {...provided.dragHandleProps}
            >
              <h6>{column.title}</h6>
              <span css={columnHeaderIdStyles}>ID: {column.columnId}</span>
            </div>
            <Droppable droppableId={droppableId} type="card">
              {(provided, snapshot) => {
                return (
                  <div
                    css={scrollContainerStyles}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div
                      css={[
                        cardListStyles,
                        snapshot.isDraggingOver && isDraggingOverColumnStyles,
                      ]}
                    >
                      {column.items.map((item, index) => (
                        <Card
                          index={index}
                          draggableId={item.itemId}
                          item={item}
                          key={item.itemId}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                );
              }}
            </Droppable>
          </div>
        );
      }}
    </Draggable>
  );
});
