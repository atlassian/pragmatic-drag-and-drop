import { token } from '@atlaskit/tokens';

import type { Appearance, CSSColor } from '../internal-types';
import { presetStrokeColors } from '../presets';
import type { Colors } from '../types';

const dedicatedStrokeColors: { [TKey in Appearance]: CSSColor } = {
	default: token('color.border.dropindicator'),
	warning: token('color.border.dropindicator.warning'),
};

export function getStrokeColor(appearance: Appearance, colors: Colors): CSSColor {
	return colors === 'dedicated'
		? dedicatedStrokeColors[appearance]
		: presetStrokeColors[appearance];
}
