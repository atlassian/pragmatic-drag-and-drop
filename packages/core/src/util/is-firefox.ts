import { cacheFirst } from './cache-first';

// using `cache` as our `isFirefox()` result will not change in a browser

/**
 * Returns `true` if a `Firefox` browser
 * */
export const isFirefox = cacheFirst(function isFirefox(): boolean {
	if (process.env.NODE_ENV === 'test') {
		return false;
	}

	return navigator.userAgent.includes('Firefox');
});
