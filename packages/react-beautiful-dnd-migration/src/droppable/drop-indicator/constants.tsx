/**
 * Maps directions to different JS/CSS properties.
 *
 * Allows logic which changes with the direction to be written only once.
 */
export const directionMapping = {
	vertical: {
		mainAxis: {
			name: 'y',
			offset: 'offsetTop',
			length: 'offsetHeight',
			scrollOffset: 'scrollTop',
			forwardEdge: 'bottom',
			overflow: 'overflowY',
			style: {
				length: 'height',
				transform: 'translateY',
			},
		},
		crossAxis: {
			name: 'x',
			offset: 'offsetLeft',
			length: 'offsetWidth',
			style: {
				length: 'width',
				offset: 'left',
			},
		},
	},
	horizontal: {
		mainAxis: {
			name: 'x',
			offset: 'offsetLeft',
			length: 'offsetWidth',
			scrollOffset: 'scrollLeft',
			forwardEdge: 'right',
			overflow: 'overflowX',
			style: {
				length: 'width',
				transform: 'translateX',
			},
		},
		crossAxis: {
			name: 'y',
			offset: 'offsetTop',
			length: 'offsetHeight',
			style: {
				length: 'height',
				offset: 'top',
			},
		},
	},
} as const;

/**
 * The thickness of the drop indicator line, in pixels.
 */
export const lineThickness = 2;

/**
 * The distance to pull the line back by, to account for its thickness.
 */
export const lineOffset = lineThickness / 2;
