import React from 'react';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, xcss } from '@atlaskit/primitives';

import { getPersonFromPosition, type Person } from '../data/people';
import { BoardContext } from '../pieces/board/board-context';
import { Card as ActualCard } from '../pieces/board/card';
import { ColumnContext } from '../pieces/board/column-context';

const containerStyles = xcss({ width: '220px' });
const person: Person = {
	...getPersonFromPosition({ position: 8 }),
	name: 'Card',
	role: 'Implied draggable',
};

export function ImpliedDraggable() {
	return (
		<BoardContext.Provider
			value={{
				instanceId: Symbol('card'),
				getColumns: () => [],
				reorderColumn: () => {},
				reorderCard: () => {},
				moveCard: () => {},
				registerCard: () => () => {},
				registerColumn: () => () => {},
			}}
		>
			<ColumnContext.Provider
				value={{
					columnId: 'fake',
					getCardIndex: () => 2,
					getNumCards: () => 10,
				}}
			>
				<Box xcss={containerStyles}>
					<ActualCard item={person} />
				</Box>
			</ColumnContext.Provider>
		</BoardContext.Provider>
	);
}
