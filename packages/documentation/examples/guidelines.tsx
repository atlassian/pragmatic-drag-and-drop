import React from 'react';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Stack } from '@atlaskit/primitives/stack';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { xcss } from '@atlaskit/primitives/xcss/xcss';

import BacklogPrototype from './pieces/backlog';
import { BoardPrototype } from './pieces/rdr-board';
import PinnedFieldsPrototype from './pieces/rdr-pinned-fields';
import { SubtasksPrototype } from './pieces/rdr-subtasks';

const containerStyles = xcss({
	padding: 'space.400',
});

export default function GuidelinesExample(): React.JSX.Element {
	return (
		<Stack space="space.1000" alignInline="center" xcss={containerStyles}>
			<PinnedFieldsPrototype />
			<SubtasksPrototype />
			<BoardPrototype />
			<BacklogPrototype />
		</Stack>
	);
}
