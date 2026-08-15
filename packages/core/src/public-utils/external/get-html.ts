import { HTMLMediaType } from '../../util/media-types/html-media-type';

import { type ContainsSource } from './native-types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function getHTML({ source }: ContainsSource): string | null {
	return source.getStringData(HTMLMediaType);
}
