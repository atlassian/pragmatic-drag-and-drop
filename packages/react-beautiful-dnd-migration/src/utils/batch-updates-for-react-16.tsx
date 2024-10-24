import { unstable_batchedUpdates, version } from 'react-dom';

const schedule: (callback: () => void) => void = (() => {
	/**
	 * We only want to do this manual batching for version 16 of React.
	 *
	 * Version 18 will automatically batch updates.
	 */
	if (
		// `unstable_batchedUpdates` is defined in all currently supported versions
		// but could be removed in the future.
		// This check is defensive and not currently necessary.
		typeof unstable_batchedUpdates === 'function' &&
		// The version export was only introduced in `react-dom@16.13.0`
		// but we need to support `react-dom@^16.8.0`
		// so we need to handle when the version is `undefined`
		(typeof version === 'undefined' || version.startsWith('16'))
	) {
		return unstable_batchedUpdates;
	}
	// Relying on react@18 to do automatic batching
	return (callback) => callback();
})();

export function batchUpdatesForReact16(callback: () => void) {
	schedule(callback);
}
