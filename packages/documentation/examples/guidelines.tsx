import React from 'react';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Stack, xcss } from '@atlaskit/primitives';

import BacklogPrototype from './pieces/backlog';
import { BoardPrototype } from './pieces/rdr-board';
import PinnedFieldsPrototype from './pieces/rdr-pinned-fields';
import { SubtasksPrototype } from './pieces/rdr-subtasks';

const containerStyles = xcss({
	padding: 'space.400',
});

export default function GuidelinesExample() {
	return (
		<Stack space="space.1000" alignInline="center" xcss={containerStyles}>
			<PinnedFieldsPrototype />
			<SubtasksPrototype />
			<BoardPrototype />
			<BacklogPrototype />
		</Stack>
	);
}
