import React, { type ReactNode } from 'react';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Stack, xcss } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

const containerStyles = xcss({
	borderRadius: token('radius.small'),
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	// overflow: 'hidden',
	minWidth: '400px',
});

const headerStyles = xcss({
	backgroundColor: 'elevation.surface.overlay',
	fontWeight: 'font.weight.bold',
	borderWidth: '0',
	borderBottomWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border',
	lineHeight: '20px',
	padding: 'space.150',
	borderTopLeftRadius: token('radius.small'),
	borderTopRightRadius: token('radius.small'),
});

const pinnedFieldsHeaderStyles = xcss({
	// paddingLeft: 'space.200',
});

export function FieldsContainer({
	children,
	title,
	isPinnedFields = false,
}: {
	children: ReactNode;
	title: string;
	isPinnedFields?: boolean;
}): React.JSX.Element {
	return (
		<Stack xcss={containerStyles}>
			<Box xcss={[headerStyles, isPinnedFields && pinnedFieldsHeaderStyles]}>{title}</Box>
			<Stack>{children}</Stack>
		</Stack>
	);
}
