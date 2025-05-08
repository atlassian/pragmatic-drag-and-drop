import { once } from '../public-utils/once';

// using `cache` as our `isSafari()` result will not change in a browser

/**
 * Returns `true` if a `Safari` browser.
 * Returns `true` if the browser is running on iOS (they are all Safari).
 *
 * Use `isSafariOnIOS` if you want to check if something is Safari + iOS
 * */
export const isSafari = once(function isSafari(): boolean {
	if (process.env.NODE_ENV === 'test') {
		return false;
	}

	const { userAgent } = navigator;
	return userAgent.includes('AppleWebKit') && !userAgent.includes('Chrome');
});
