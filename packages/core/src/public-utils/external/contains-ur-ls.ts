import { URLMediaType } from '../../util/media-types/url-media-type';

import { type ContainsSource } from './native-types';
import { firefoxURLType } from './url';

export function containsURLs({ source }: ContainsSource): boolean {
	return source.types.includes(URLMediaType) || source.types.includes(firefoxURLType);
}
