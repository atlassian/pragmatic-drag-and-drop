import React from 'react';

import Code from '@atlaskit/code/code';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/list-item';
import { Stack } from '@atlaskit/primitives/compiled/stack';

import { Item } from '../simple-item';

export function ListItemVerticalExample(): React.JSX.Element {
	return (
		<Stack>
			{(['reorder-before', 'combine', 'reorder-after'] as const).map((operation) => (
				<Item
					key={operation}
					dropIndicator={
						<DropIndicator
							instruction={{ operation: operation, axis: 'vertical', blocked: false }}
						/>
					}
					content={
						<>
							Operation: <Code>{operation}</Code>
						</>
					}
				/>
			))}
		</Stack>
	);
}
