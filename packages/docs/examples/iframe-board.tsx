import React, { useMemo } from 'react';

import { Box, Inline, xcss } from '@atlaskit/primitives';
import { useThemeObserver } from '@atlaskit/tokens';

import { Column } from './pieces/iframe-board/column';

const iframeStyles = xcss({ border: 'none', width: '250px' });

export default function IFrameBoard() {
  const theme = useThemeObserver();
  const iframeSrc = useMemo(() => {
    const url = new URL('/examples.html', window.location.origin);
    url.searchParams.set('groupId', 'pragmatic-drag-and-drop');
    url.searchParams.set('packageId', 'docs');
    url.searchParams.set('exampleId', 'iframe-column');
    if (theme.colorMode) {
      url.searchParams.set('mode', theme.colorMode);
    }

    return url.href;
  }, [theme.colorMode]);

  return (
    <Box padding="space.500">
      <Inline space="space.200" alignInline="center">
        <Column columnId={'first'} />
        <Box as="iframe" src={iframeSrc} xcss={iframeStyles} />
      </Inline>
    </Box>
  );
}
