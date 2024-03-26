import React, { forwardRef, memo, Ref, useMemo } from 'react';

import { useDragDropContext } from '../drag-drop-context/internal-context';
import { useDraggableDimensions } from '../hooks/use-captured-dimensions';
import { attributes } from '../utils/attributes';

export const Placeholder = memo(
  forwardRef(function Placeholder(
    { style: styleProp }: { style?: React.CSSProperties },
    ref: Ref<HTMLDivElement>,
  ) {
    const dimensions = useDraggableDimensions();

    const { contextId } = useDragDropContext();
    const dataAttributes = {
      [attributes.placeholder.contextId]: contextId,
    };

    const style: React.CSSProperties | undefined = useMemo(() => {
      if (!dimensions) {
        return;
      }

      const { margin, rect } = dimensions;

      return {
        boxSizing: 'border-box',
        width: rect.width,
        height: rect.height,
        margin: margin,
        ...styleProp,
      };
    }, [dimensions, styleProp]);

    return <div ref={ref} style={style} {...dataAttributes} />;
  }),
);
