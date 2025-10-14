import React from 'react';

import { Stack } from '@atlaskit/primitives/compiled';

import { DropIndicator } from '../../../src/border';
import { Item } from '../simple-item';

export function BorderShowcaseExample() {
	return (
		<Stack space="space.200">
			<Item content="default" dropIndicator={<DropIndicator appearance="default" />} />
			<Item content="warning" dropIndicator={<DropIndicator appearance="warning" />} />
		</Stack>
	);
}
