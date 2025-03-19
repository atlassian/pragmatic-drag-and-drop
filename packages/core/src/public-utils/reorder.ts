/**
 * A function that will reorder an array (`list`).
 * `reorder` returns a new array with reordered items and does not
 *  modify the original array. The items in the array are also not modified.
 */
export function reorder<Value>({
	list,
	startIndex,
	finishIndex,
}: {
	list: Value[];
	startIndex: number;
	finishIndex: number;
}): Value[] {
	if (startIndex === -1 || finishIndex === -1) {
		// Making this function consistently return a new array reference.
		// This is consistent with .toSorted() which always returns a new array
		// even when it does not do anything
		return Array.from(list);
	}

	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(finishIndex, 0, removed);

	return result;
}
