import { once } from '../public-utils/once';

// Using `once` as the value won't change in a browser

export const isAndroid: (this: unknown) => boolean = once(function isAndroid(): boolean {
	return navigator.userAgent.toLocaleLowerCase().includes('android');
});

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const androidFallbackText = 'pdnd:android-fallback';
