/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */

import { css, jsx } from '@emotion/react';

import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { token } from '@atlaskit/tokens';

import { gapSize } from './constants';

const terminalRadius = 6;
const lineThickness = 2;

const dropIndicatorStyles = css({
  position: 'absolute',
  left: 0,
  width: '100%',
  height: lineThickness,
  background: token('color.border.selected'),

  '::before': {
    content: '""',
    width: terminalRadius * 2,
    height: terminalRadius * 2,
    background: token('color.border.selected'),
    position: 'absolute',
    left: -terminalRadius * 2,
    top: -terminalRadius + lineThickness / 2,
    borderRadius: '50%',
  },
});

const dropIndicatorEdgeStyles = {
  top: css({
    top: -(gapSize / 2 + lineThickness),
  }),
  bottom: css({
    bottom: -(gapSize / 2 + lineThickness),
  }),
  left: {},
  right: {},
};

export function DropIndicator({ edge }: { edge: Edge }) {
  return <div css={[dropIndicatorStyles, dropIndicatorEdgeStyles[edge]]} />;
}
