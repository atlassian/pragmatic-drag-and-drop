import { textMediaType } from '../../util/media-types/text-media-type';

import { type ContainsSource } from './native-types';

export function containsText({ source }: ContainsSource): boolean {
	return source.types.includes(textMediaType);
}
