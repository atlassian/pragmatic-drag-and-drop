import { token } from '@atlaskit/tokens';

import type { Appearance, CSSColor } from './internal-types';

export const presetStrokeColors: { [TKey in Appearance]: CSSColor } = {
	default: token('color.border.selected'),
	warning: token('color.border.warning'),
};

export const presetStrokeWidth = token('border.width.outline');
