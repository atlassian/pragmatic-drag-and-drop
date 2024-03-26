import { useCallback, useEffect, useRef } from 'react';

/**
 * Allows access to a changing value in a stable way.
 */
export function useStable<Value>(value: Value): () => Value {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  const getValue = useCallback(() => {
    return ref.current;
  }, []);

  return getValue;
}
