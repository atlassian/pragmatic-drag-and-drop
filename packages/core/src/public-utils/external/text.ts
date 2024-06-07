import { textMediaType } from '../../util/media-types/text-media-type';

import { type ContainsSource } from './native-types';

export function containsText({ source }: ContainsSource): boolean {
	return source.types.includes(textMediaType);
}

/* Get the plain text that a user is dragging */
export function getText({ source }: ContainsSource): string | null {
	return source.getStringData(textMediaType);
}
