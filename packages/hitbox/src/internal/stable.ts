import { isShallowEqual } from './isShallowEqual';

type TData = Record<string, unknown>;

/**
 * Used to store a stable object, which returns a new object only if one of the values has changed
 */
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function stable<T extends TData>(isEqual: (a: T, b: T) => boolean = isShallowEqual): any {
	let cache: { value: T } | null = null;

	return (value: T): T => {
		if (cache && isEqual(cache.value, value)) {
			return cache.value;
		}
		cache = { value };
		return cache.value;
	};
}
