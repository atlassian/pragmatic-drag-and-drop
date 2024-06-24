import React from 'react';

import Lozenge, { type ThemeAppearance as LozengeAppearance } from '@atlaskit/lozenge';

import type { Epic } from './data';

const appearanceMap: Record<Epic, LozengeAppearance> = {
	forms: 'new',
	accounts: 'success',
	billing: 'inprogress',
};

export function EpicLozenge({ epic }: { epic: Epic }) {
	return (
		<Lozenge appearance={appearanceMap[epic]} isBold>
			{epic}
		</Lozenge>
	);
}
