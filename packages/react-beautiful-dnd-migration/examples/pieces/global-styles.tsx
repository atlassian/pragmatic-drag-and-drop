import React from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/no-global-styles, @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, Global } from '@emotion/react';

const globalStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':root': {
		'--grid': '8px',
		'--card-gap': 'var(--grid)',
		'--column-gap': 'calc(var(--grid) * 2)',
	},
});

export function GlobalStyles() {
	return <Global styles={globalStyles} />;
}
