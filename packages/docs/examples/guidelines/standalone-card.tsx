import React from 'react';

import { Box, xcss } from '@atlaskit/primitives';

import { getPerson } from '../data/people';
import { BoardContext } from '../pieces/board/board-context';
import { Card as ActualCard } from '../pieces/board/card';
import { ColumnContext } from '../pieces/board/column-context';

const containerStyles = xcss({ width: '220px' });
const person = getPerson();

export function StandaloneCard() {
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
