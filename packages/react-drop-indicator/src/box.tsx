import React from 'react';

import type { DropIndicatorProps } from './box-without-terminal';
import { Line } from './internal/line';

export type { DropIndicatorProps };

/**
 * __Drop indicator__
 *
 * A drop indicator is used to communicate the intended resting place of the draggable item. The orientation of the drop indicator should always match the direction of the content flow.
 */
export function DropIndicator({ edge, gap = '0px' }: DropIndicatorProps) {
	return <Line edge={edge} gap={gap} />;
}

// This default export is intended for usage with React.lazy
export default DropIndicator;
