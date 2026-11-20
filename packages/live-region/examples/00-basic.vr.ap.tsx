import React, { useEffect } from 'react';

import { announce, cleanup } from '@atlaskit/pragmatic-drag-and-drop-live-region';

export default function BasicExample(): React.JSX.Element {
	useEffect(() => {
		announce('Test message');
		return cleanup;
	}, []);

	return <p>This page has a live region announcement but it is visually hidden.</p>;
}
