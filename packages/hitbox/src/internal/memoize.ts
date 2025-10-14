type TData = Record<string, unknown>;

export function isShallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false;
	}
	return aKeys.every((key) => Object.is(a[key], b[key]));
}

/**
 * Used to store a stable object, which returns a new object only if one of the values has changed
 */
export function stable<T extends TData>(isEqual: (a: T, b: T) => boolean = isShallowEqual) {
	let cache: { value: T } | null = null;

	return (value: T): T => {
		if (cache && isEqual(cache.value, value)) {
			return cache.value;
		}
		cache = { value };
		return cache.value;
	};
}
