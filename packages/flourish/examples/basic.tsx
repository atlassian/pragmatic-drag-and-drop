import React, { useCallback, useRef } from 'react';

import Button from '@atlaskit/button/default/button';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box } from '@atlaskit/primitives/box';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Stack } from '@atlaskit/primitives/stack';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { xcss } from '@atlaskit/primitives/xcss/xcss';

import { triggerPostMoveFlash } from '../src/trigger-post-move-flash';

const cardStyles = xcss({
	width: '100%',
	height: '100px',
	backgroundColor: 'elevation.surface.raised',
	boxShadow: 'elevation.shadow.raised',
	borderRadius: 'radius.small',
});

export default function BasicExample(): React.JSX.Element {
	const ref = useRef<HTMLElement>(null);

	const runAnimation = useCallback(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		triggerPostMoveFlash(element);
	}, []);

	return (
		<Stack space="space.200" alignInline="center">
			<Box ref={ref} xcss={cardStyles} />
			<Button onClick={runAnimation}>Run animation</Button>
		</Stack>
	);
}
