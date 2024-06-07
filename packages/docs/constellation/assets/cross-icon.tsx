import React from 'react';

import AkCrossIcon from '@atlaskit/icon/glyph/cross-circle';
import { R400 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return <AkCrossIcon label="unsupported" primaryColor={token('color.icon.danger', R400)} />;
}
