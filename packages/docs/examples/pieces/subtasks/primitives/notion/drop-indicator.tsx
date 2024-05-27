/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */

import { css, jsx } from '@emotion/react';

import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { token } from '@atlaskit/tokens';

const lineThickness = 4;

const dropIndicatorStyles = css({
  position: 'absolute',
  left: 0,
  width: '100%',
  height: lineThickness,
  background: token('color.border.selected'),
});

const dropIndicatorEdgeStyles = {
  top: css({
    top: `calc(-1 * (var(--gap) / 2 + ${lineThickness}px / 2))`,
  }),
  bottom: css({
    bottom: `calc(-1 * (var(--gap) / 2 + ${lineThickness}px / 2))`,
  }),
  left: {},
  right: {},
};

export function DropIndicator({ edge, gap }: { edge: Edge; gap: string }) {
  return (
    <div
      style={{ '--gap': gap } as React.CSSProperties}
      css={[dropIndicatorStyles, dropIndicatorEdgeStyles[edge]]}
    />
  );
}
