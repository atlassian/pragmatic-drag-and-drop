import { once } from '../public-utils/once';

// using `cache` as our `isAndroid()` result will not change in a browser
export const isAndroid = once(function isAndroid(): boolean {
	return navigator.userAgent.toLocaleLowerCase().includes('android');
});

export const androidFallbackText = 'pdnd:android-fallback';
