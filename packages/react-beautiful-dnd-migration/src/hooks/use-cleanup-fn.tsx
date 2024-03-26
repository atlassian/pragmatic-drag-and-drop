import { useEffect, useState } from 'react';

import type { CleanupFn } from '../internal-types';

const noop = () => {};

function createCleanupManager() {
  let cleanupFn = noop;

  const setCleanupFn = (newCleanupFn: CleanupFn) => {
    cleanupFn = newCleanupFn;
  };

  const runCleanupFn = () => {
    cleanupFn();
    cleanupFn = noop;
  };

  return { setCleanupFn, runCleanupFn };
}

export function useCleanupFn() {
  const [cleanupManager] = useState(createCleanupManager);

  /**
   * Run the cleanup function on unmount.
   */
  useEffect(() => {
    return cleanupManager.runCleanupFn;
  }, [cleanupManager.runCleanupFn]);

  return cleanupManager;
}
