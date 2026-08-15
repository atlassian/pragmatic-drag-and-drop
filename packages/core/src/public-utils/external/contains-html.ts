import { HTMLMediaType } from '../../util/media-types/html-media-type';

import { type ContainsSource } from './native-types';

export function containsHTML({ source }: ContainsSource): boolean {
	return source.types.includes(HTMLMediaType);
}
