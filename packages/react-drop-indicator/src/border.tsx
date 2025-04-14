import React from 'react';

import type { Appearance, CSSSize } from './internal-types';
import { Border } from './internal/border';
import { presetStrokeColors } from './presets';

export function DropIndicator({
	appearance = 'default',
	indent,
}: {
	appearance?: Appearance;
	indent?: CSSSize;
}) {
	return <Border strokeColor={presetStrokeColors[appearance]} indent={indent} />;
}

// For React.lazy
export default DropIndicator;
