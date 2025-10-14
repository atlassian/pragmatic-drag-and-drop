import React from 'react';

import { Code } from '@atlaskit/code';
import { Stack } from '@atlaskit/primitives/compiled';

import { DropIndicator } from '../../../src/list-item';
import { Item } from '../simple-item';

export function ListItemVerticalExample() {
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
