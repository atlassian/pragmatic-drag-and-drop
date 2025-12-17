import React from 'react';

import AkWarningIcon from '@atlaskit/icon/core/status-warning';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return (
		<AkWarningIcon spacing="spacious" label="partial support" color={token('color.icon.warning')} />
	);
}
