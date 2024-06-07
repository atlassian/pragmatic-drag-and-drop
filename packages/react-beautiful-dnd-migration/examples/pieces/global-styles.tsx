import React from 'react';

import { css, Global } from '@emotion/react';

const globalStyles = css({
	':root': {
		'--grid': '8px',
		'--card-gap': 'var(--grid)',
		'--column-gap': 'calc(var(--grid) * 2)',
	},
});

export function GlobalStyles() {
	return <Global styles={globalStyles} />;
}
