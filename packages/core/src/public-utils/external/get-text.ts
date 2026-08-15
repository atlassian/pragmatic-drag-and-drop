import { textMediaType } from '../../util/media-types/text-media-type';

import { type ContainsSource } from './native-types';

/* Get the plain text that a user is dragging */
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function getText({ source }: ContainsSource): string | null {
	return source.getStringData(textMediaType);
}
