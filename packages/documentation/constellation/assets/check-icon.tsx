import React from 'react';

import AkCheckIcon from '@atlaskit/icon/core/migration/status-success--check-circle';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return <AkCheckIcon spacing="spacious" label="supported" color={token('color.icon.success')} />;
}
