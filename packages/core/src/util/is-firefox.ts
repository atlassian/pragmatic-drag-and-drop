import { once } from '../public-utils/once';

// using `cache` as our `isFirefox()` result will not change in a browser

/**
 * Returns `true` if a `Firefox` browser
 * */
export const isFirefox = once(function isFirefox(): boolean {
	if (process.env.NODE_ENV === 'test') {
		return false;
	}

	return navigator.userAgent.includes('Firefox');
});
