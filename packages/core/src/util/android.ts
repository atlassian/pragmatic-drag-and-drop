import { cacheFirst } from './cache-first';

// using `cache` as our `isAndroid()` result will not change in a browser
export const isAndroid = cacheFirst(function isAndroid(): boolean {
  return navigator.userAgent.toLocaleLowerCase().includes('android');
});

export const androidFallbackText = 'pdnd:android-fallback';
