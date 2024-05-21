import { type ContainsSource, type PredicateFn } from './native-types';

/**
 * Will return `true` when any native predicate function returns `true`.
 * Using the name `"some"` for consistency with `Array.prototype.some`.\
 *
 * @example
 *
 * ```ts
 * monitorForNative({
 *  // enable monitor when dragging files or text
 *  canMonitor: some(containsFiles, containsText),
 * });
 *
 * monitorForNative({
 *  // enable monitor when dragging external files or internal text
 *  canMonitor: some(external(containsFiles), internal(containsText)),
 * });
 * ```
 */
export function some(...predicates: PredicateFn[]): PredicateFn {
  return function combined(payload: ContainsSource): boolean {
    return predicates.some(fn => fn(payload));
  };
}
