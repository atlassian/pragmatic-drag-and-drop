import React from 'react';

import AkQuestionIcon from '@atlaskit/icon/core/migration/question-circle';
import { N200 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
	return (
		<AkQuestionIcon
			spacing="spacious"
			label="unknown support"
			color={token('color.icon.accent.gray', N200)}
		/>
	);
}
