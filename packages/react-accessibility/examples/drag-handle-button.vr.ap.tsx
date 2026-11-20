import React from 'react';

import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';

export default function DragHandleButtonExample(): React.JSX.Element {
	return (
		<React.StrictMode>
			<DragHandleButton label="Reorder" />
		</React.StrictMode>
	);
}
