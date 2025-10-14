import { once } from '../public-utils/once';

// Using `once` as the value won't change in a browser

export const isAndroid = once(function isAndroid(): boolean {
	return navigator.userAgent.toLocaleLowerCase().includes('android');
});

export const androidFallbackText = 'pdnd:android-fallback';
