import { HTMLMediaType } from '../../util/media-types/html-media-type';

import { type ContainsSource } from './native-types';

export function containsHTML({ source }: ContainsSource): boolean {
	return source.types.includes(HTMLMediaType);
}

export function getHTML({ source }: ContainsSource): string | null {
	return source.getStringData(HTMLMediaType);
}
