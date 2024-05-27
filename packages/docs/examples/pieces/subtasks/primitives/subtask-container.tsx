/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const subtaskContainerStyles = css({
  // for parent placement
  flexGrow: 1,
  flexBasis: 0,
  background: token('elevation.surface.raised'),
  boxShadow: token('elevation.shadow.raised'),
  borderRadius: 3,
  maxWidth: 560,
  minWidth: 400,
});

const subtaskContainerPaddingStyles = css({ padding: 2 });

type SubtaskContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hasContainerPadding?: boolean;
};

export const SubtaskContainer = forwardRef<
  HTMLDivElement,
  SubtaskContainerProps
>(function SubtaskContainer(
  { children, hasContainerPadding = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      css={[
        subtaskContainerStyles,
        hasContainerPadding && subtaskContainerPaddingStyles,
      ]}
      {...props}
    >
      {children}
    </div>
  );
});
