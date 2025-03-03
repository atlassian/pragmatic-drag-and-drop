import { token } from '@atlaskit/tokens';

import type { StrokeColor, StrokeWidth } from './internal-types';

export const presetStrokeColors: { [TKey in StrokeColor]: string } = {
	standard: token('color.border.selected'),
	warning: token('color.border.warning'),
};

export const presetStrokeSizes: { [TKey in StrokeWidth]: string } = {
	standard: token('border.width.outline'),
};
