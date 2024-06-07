export function getPercentageInRange({
	startOfRange,
	endOfRange,
	value,
}: {
	startOfRange: number;
	endOfRange: number;
	value: number;
}): number {
	// checking inputs
	const isValid: boolean = startOfRange < endOfRange;

	if (!isValid) {
		return 0;
	}

	if (value < startOfRange) {
		return 0;
	}
	if (value > endOfRange) {
		return 1;
	}

	const range: number = endOfRange - startOfRange;
	return (value - startOfRange) / range;
}
