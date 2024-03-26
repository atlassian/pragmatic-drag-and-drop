import { CleanupFn } from '../internal-types';

/** Create a new combined function that will call all the provided functions */
export function combine(...fns: CleanupFn[]): CleanupFn {
  return function cleanup() {
    fns.forEach(fn => fn());
  };
}
