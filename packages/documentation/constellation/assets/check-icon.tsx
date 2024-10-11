import React from 'react';

import AkCheckIcon from '@atlaskit/icon/core/migration/success--check-circle';
import { G400 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return (
		<AkCheckIcon spacing="spacious" label="supported" color={token('color.icon.success', G400)} />
	);
}
