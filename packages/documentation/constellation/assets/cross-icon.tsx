import React from 'react';

import AkCrossIcon from '@atlaskit/icon/core/migration/cross-circle';
import { R400 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return (
		<AkCrossIcon spacing="spacious" label="unsupported" color={token('color.icon.danger', R400)} />
	);
}
