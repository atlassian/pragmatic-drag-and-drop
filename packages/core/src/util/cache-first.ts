/**
 * Create a new function that will cache the result of it's first call forever.
 * This is similar to `memoize-one`, except the cache for `memoize-one` can be
 * updated if the arguments change.
 *
 * @example
 * function sayHello(name: string): string {
 *   return `Hello ${name}`;
 * }
 * const cached = cacheFirst(sayHello);
 *
 * cached('Alex');
 * cached('Declan'); // original result of `sayHello` call is returned
 */
export function cacheFirst<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (...args: Parameters<TFunc>) => ReturnType<TFunc> {
  let result: { value: ReturnType<TFunc> } | null = null;

  return function single(...args: Parameters<TFunc>): ReturnType<TFunc> {
    if (!result) {
      result = { value: fn(...args) };
    }
    return result.value;
  };
}
