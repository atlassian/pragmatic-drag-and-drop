import React from 'react';

import type { Appearance, CSSSize } from './internal-types';
import { Border } from './internal/border';
import { getStrokeColor } from './internal/get-stroke-color';
import type { Colors } from './types';

export function DropIndicator({
	appearance = 'default',
	colors = 'standard',
	indent,
}: {
	appearance?: Appearance;
	/** Token roles to use. Defaults to `standard`. */
	colors?: Colors;
	indent?: CSSSize;
}): React.JSX.Element {
	return <Border strokeColor={getStrokeColor(appearance, colors)} indent={indent} />;
}

// For React.lazy
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export default DropIndicator;
