import React, { useCallback, useRef } from 'react';

import Button from '@atlaskit/button/new';
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { triggerPostMoveFlash } from '../src/trigger-post-move-flash';

const cardStyles = xcss({
  width: '100%',
  height: '100px',
  backgroundColor: 'elevation.surface.raised',
  boxShadow: 'elevation.shadow.raised',
  borderRadius: 'border.radius.100',
});

export default function BasicExample() {
  const ref = useRef<HTMLElement>(null);

  const runAnimation = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    triggerPostMoveFlash(element);
  }, []);

  return (
    <Stack space="space.200" alignInline="center">
      <Box ref={ref} xcss={cardStyles} />
      <Button onClick={runAnimation}>Run animation</Button>
    </Stack>
  );
}
