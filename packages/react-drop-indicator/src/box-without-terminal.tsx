import React from 'react';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

import type { CSSSize } from './internal-types';
import { Line } from './internal/line';

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
	 * `gap` should be a valid CSS length.
	 * @example "8px"
	 * @example "var(--gap)"
	 */
	gap?: CSSSize;
};

// Not adding a ENG-HEALTH ticket, as we will do the migration
// eslint-disable-next-line @repo/internal/deprecations/deprecation-ticket-required
/**
 * @deprecated Please now use our `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box` drop indicator with the `type="no-terminal"` prop.
 *
 * __Drop indicator__
 *
 * A drop indicator is used to communicate the intended resting place of the draggable item. The orientation of the drop indicator should always match the direction of the content flow.
 *
 */
export function DropIndicator({ edge, gap }: DropIndicatorProps) {
	return <Line edge={edge} gap={gap} type="no-terminal" />;
}

// This default export is intended for usage with React.lazy
export default DropIndicator;
