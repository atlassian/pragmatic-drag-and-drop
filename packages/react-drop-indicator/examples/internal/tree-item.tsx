/** @jsx jsx */

import type { CSSProperties } from 'react';

import { css, jsx } from '@emotion/react';

import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../src/tree-item';

const itemStyles = css({
  display: 'flex',
  minWidth: 120,
  padding: 8,
  alignItems: 'center',
  gap: 4,
  borderRadius: 3,
  position: 'relative',
  paddingLeft: 'calc(var(--horizontal-indent) + 1ch)',
  background: token('elevation.surface.sunken', '#F7F8F9'),
});

function getLabel(instruction: Instruction): string {
  if (instruction.type === 'instruction-blocked') {
    return `[Blocked] ${getLabel(instruction.desired)}`;
  }
  if (instruction.type === 'reparent') {
    return `reparent (lvl${instruction.currentLevel} → lvl${instruction.desiredLevel})`;
  }
  return instruction.type;
}

export default function TreeItem({
  instruction,
  indentPerLevel,
  currentLevel,
}: {
  instruction: Instruction;
  indentPerLevel: number;
  currentLevel: number;
}) {
  return (
    <div
      css={itemStyles}
// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
      style={
        {
          '--horizontal-indent': `${indentPerLevel * currentLevel}px`,
        } as CSSProperties
      }
    >
      <span>Instruction: </span>
      <code>
        <small>{getLabel(instruction)}</small>
      </code>
      <DropIndicator instruction={instruction} />
    </div>
  );
}
