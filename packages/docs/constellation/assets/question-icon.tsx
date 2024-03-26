import React from 'react';

import AkQuestionIcon from '@atlaskit/icon/glyph/question-circle';
import { N200 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

export default function CheckIcon() {
  return (
    <AkQuestionIcon
      label="unknown support"
      primaryColor={token('color.icon.accent.gray', N200)}
    />
  );
}
