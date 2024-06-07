/** @jsx jsx */
import { css, Global, jsx } from '@emotion/react';

const globalStyles = css({
	':root': {
		'--grid': '8px',
		'--border-radius': '2px',
		'--border-width': '2px',
	},
});

export function GlobalStyles() {
	return <Global styles={globalStyles} />;
}
