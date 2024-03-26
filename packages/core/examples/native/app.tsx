/** @jsx jsx */
import { Fragment } from 'react';

import { css, jsx } from '@emotion/react';

import { GlobalStyles } from '../_util/global-styles';

import { ActivityLog } from './activity-log';
import { Content } from './content';
import { DropTarget } from './drop-target';

const appStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  padding: 'var(--grid)',
  gap: 'calc(var(--grid) * 2)',
  maxWidth: '1000px',
});

export function App() {
  return (
    <Fragment>
      <GlobalStyles />
      <div css={appStyles}>
        <Content />
        <DropTarget />
        <ActivityLog />
      </div>
    </Fragment>
  );
}
