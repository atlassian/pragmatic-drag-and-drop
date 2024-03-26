/** Provide a function that you only ever want to be called a single time */
export function once<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
): (
  this: ThisParameterType<TFunc>,
  ...args: Parameters<TFunc>
) => ReturnType<TFunc> {
  let cache: { result: ReturnType<TFunc> } | null = null;

  return function wrapped(
    this: ThisParameterType<TFunc>,
    ...args: Parameters<TFunc>
  ): ReturnType<TFunc> {
    if (!cache) {
      const result = fn.apply(this, args);
      cache = {
        result: result,
      };
    }
    return cache.result;
  };
}
