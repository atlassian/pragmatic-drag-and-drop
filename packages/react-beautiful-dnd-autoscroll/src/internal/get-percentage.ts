// Source: https://github.com/atlassian/react-beautiful-dnd

type Args = {
	startOfRange: number;
	endOfRange: number;
	current: number;
};

export const getPercentage = ({ startOfRange, endOfRange, current }: Args): number => {
	const range: number = endOfRange - startOfRange;

	if (range === 0) {
		/**
		 * Detected distance range of 0 in the auto scroller
		 * This is unexpected and would cause a divide by 0 issue.
		 * Not allowing an auto scroll
		 */
		return 0;
	}

	const currentInRange: number = current - startOfRange;
	const percentage: number = currentInRange / range;
	return percentage;
};
