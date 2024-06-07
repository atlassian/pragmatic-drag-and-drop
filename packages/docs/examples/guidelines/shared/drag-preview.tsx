import React from 'react';

import { Box, xcss } from '@atlaskit/primitives';

const previewStyles = xcss({
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	padding: 'space.100',
	borderRadius: 'border.radius',
	backgroundColor: 'elevation.surface',
});

export function DragPreview() {
	return <Box xcss={previewStyles}>Item drag preview</Box>;
}
