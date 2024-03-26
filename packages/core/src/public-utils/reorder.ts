/**
 * Reorder a provided `list`
 * Returns a new array and does not modify the original array
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
    return list;
  }

  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(finishIndex, 0, removed);

  return result;
}
