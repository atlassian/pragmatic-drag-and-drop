import React from 'react';

import type { Appearance, CSSSize } from './internal-types';
import { Line } from './internal/line';
import { presetStrokeColors } from './presets';
import type { Edge } from './types';

export type DropIndicatorProps = {
	/**
	 * The `edge` to draw a drop indicator on.
	 *
	 * `edge` is required as for the best possible performance
	 * outcome you should only render this component when it needs to do something
	 *
	 * @example {closestEdge && <DropIndicator edge={closestEdge} />}
	 */
	edge: Edge;
	/**
	 * `gap` allows you to position the drop indicator further away from the drop target.
	 * `gap` should be the distance between your drop targets
	 * a drop indicator will be rendered halfway between the drop targets
	 * (the drop indicator will be offset by half of the `gap`)
	 *
	 * `gap` should be a valid CSS size.
	 *
	 * @example "8px"
	 * @example "var(--gap)"
	 */
	gap?: CSSSize;

	/**
	 * This will control what color the indicator is set to
	 */
	appearance?: Appearance;

	/**
	 * Which style of indicator should be used
	 *
	 * *"terminal"*
	 *
	 * - display a terminal (circle with a whole in it) at the start of the line
	 * - half the size of the terminal will "bleed out" of the containing element
	 *
	 * *"terminal-no-bleed"*
	 *
	 * - display a terminal (circle with a whole in it) at the start of the line
	 * - the terminal will _not_ "bleed out" of the containing element
	 * - this is useful in situations where the terminal cannot bleed out
	 *   (such as when inside scroll containers with no padding)
	 *
	 * *"no-terminal"*
	 *
	 * - display a full width line with no terminal
	 */
	type?: Parameters<typeof Line>[0]['type'];

	/**
	 * Add additional indentation on the main axis of the line.
	 * Useful in situations where you want to shift the line along a larger element.
	 *
	 * `indent` should be a valid CSS size.
	 *
	 * @example "20px"
	 * @example "var(--indent)"
	 */
	indent?: CSSSize;
};

/**
 * __Drop indicator__
 *
 * A drop indicator is used to communicate the intended resting place of the draggable item. The orientation of the drop indicator should always match the direction of the content flow.
 */
export function DropIndicator({
	appearance = 'default',
	edge,
	gap,
	indent,
	type,
}: DropIndicatorProps) {
	return (
		<Line
			edge={edge}
			gap={gap}
			strokeColor={presetStrokeColors[appearance]}
			type={type}
			indent={indent}
		/>
	);
}

// This default export is intended for usage with React.lazy
export default DropIndicator;
