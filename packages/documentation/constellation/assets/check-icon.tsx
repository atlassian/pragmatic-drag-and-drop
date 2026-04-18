import React from 'react';

import AkCheckIcon from '@atlaskit/icon/core/status-success';
import { token } from '@atlaskit/tokens';

export default function CheckIcon(): React.JSX.Element {
	return <AkCheckIcon spacing="spacious" label="supported" color={token('color.icon.success')} />;
}
