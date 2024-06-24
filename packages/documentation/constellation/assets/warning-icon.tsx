import React from 'react';

import AkWarningIcon from '@atlaskit/icon/glyph/warning';
import { Y400 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return <AkWarningIcon label="partial support" primaryColor={token('color.icon.warning', Y400)} />;
}
