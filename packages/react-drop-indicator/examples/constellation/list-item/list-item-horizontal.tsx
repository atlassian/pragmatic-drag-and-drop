import React from 'react';

import Code from '@atlaskit/code/code';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/list-item';
import { Inline } from '@atlaskit/primitives/compiled/inline';

import { Item } from '../simple-item';

export function ListItemHorizontalExample(): React.JSX.Element {
	return (
		<Inline>
			{(['reorder-before', 'combine', 'reorder-after'] as const).map((operation) => (
				<Item
					key={operation}
					dropIndicator={
						<DropIndicator
							instruction={{ operation: operation, axis: 'horizontal', blocked: false }}
						/>
					}
					content={
						<>
							Operation: <Code>{operation}</Code>
						</>
					}
				/>
			))}
		</Inline>
	);
}
