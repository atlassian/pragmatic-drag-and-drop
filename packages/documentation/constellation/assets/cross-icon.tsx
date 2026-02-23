import React from 'react';

import AkCrossIcon from '@atlaskit/icon/core/cross-circle';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return <AkCrossIcon spacing="spacious" label="unsupported" color={token('color.icon.danger')} />;
}
