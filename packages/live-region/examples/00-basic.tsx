import React, { useEffect } from 'react';

import { announce, cleanup } from '../src';

export default function BasicExample() {
  useEffect(() => {
    announce('Test message');
    return cleanup;
  }, []);

  return (
    <p>This page has a live region announcement but it is visually hidden.</p>
  );
}
