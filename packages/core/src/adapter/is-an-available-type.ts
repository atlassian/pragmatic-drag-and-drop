import { androidFallbackText } from '../util/android';
import { textMediaType } from '../util/media-types/text-media-type';

import { elementAdapterNativeDataKey } from './element-adapter-native-data-key';

export function isAnAvailableType({ type, value }: { type: string; value: string }): boolean {
	// We don't want to expose our private elementAdapter key / value
	if (type === elementAdapterNativeDataKey) {
		return false;
	}
	// Not exposing "text/plain" if it contains the android fallback text
	// We _could_ add an `isAndroid()` check, but it's probably safest
	// to trim this data out, regardless of what OS we see it on.
	if (type === textMediaType && value === androidFallbackText) {
		return false;
	}
	return true;
}
