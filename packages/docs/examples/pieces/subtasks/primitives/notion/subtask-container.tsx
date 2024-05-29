/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import ChevronDownCircleIcon from '@atlaskit/icon/glyph/chevron-down-circle';
import EditorTextStyleIcon from '@atlaskit/icon/glyph/editor/text-style';
import RecentIcon from '@atlaskit/icon/glyph/recent';
import { token } from '@atlaskit/tokens';

const subtaskContainerStyles = css({
  // for parent placement
  flexGrow: 1,
  flexBasis: 0,
  // background: token('elevation.surface'),
  maxWidth: 560,
});

type SubtaskContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const headingRowStyles = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  border: `1px solid ${token('color.border')}`,
  borderInlineWidth: 0,
});

const headingStyles = css({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: 4,
  ':not(:first-of-type)': {
    borderLeft: `1px solid ${token('color.border')}`,
  },
});

function Heading({ children }: { children: ReactNode }) {
  return <div css={headingStyles}>{children}</div>;
}

export const SubtaskContainer = forwardRef<
  HTMLDivElement,
  SubtaskContainerProps
>(function SubtaskContainer({ children, ...props }, ref) {
  return (
    <div ref={ref} css={subtaskContainerStyles} {...props}>
{/* eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766 */}
      <div style={{ paddingLeft: 24 }}>
        <div css={headingRowStyles}>
          <Heading>
            <EditorTextStyleIcon label="" size="small" />
            Name
          </Heading>
          <Heading>
            <RecentIcon label="" size="small" />
            Date Created
          </Heading>
          <Heading>
            <ChevronDownCircleIcon label="" size="small" />
            Status
          </Heading>
        </div>
      </div>
      {children}
    </div>
  );
});
