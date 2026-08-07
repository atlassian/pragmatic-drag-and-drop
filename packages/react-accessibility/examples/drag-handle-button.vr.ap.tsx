import React from 'react';

import { DragHandleButton } from '../src/drag-handle-button';

export default function DragHandleButtonExample(): React.JSX.Element {
	return (
		<React.StrictMode>
			<DragHandleButton label="Reorder" />
		</React.StrictMode>
	);
}
