import React from 'react';

import AkCheckIcon from '@atlaskit/icon/glyph/check-circle';
import { G400 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return <AkCheckIcon label="supported" primaryColor={token('color.icon.success', G400)} />;
}
