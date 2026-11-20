import React from 'react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/border';
import { Stack } from '@atlaskit/primitives/compiled/stack';

import { Item } from '../simple-item';

export function BorderShowcaseExample(): React.JSX.Element {
	return (
		<Stack space="space.200">
			<Item content="default" dropIndicator={<DropIndicator appearance="default" />} />
			<Item content="warning" dropIndicator={<DropIndicator appearance="warning" />} />
		</Stack>
	);
}
