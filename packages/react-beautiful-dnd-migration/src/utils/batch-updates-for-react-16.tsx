import { unstable_batchedUpdates, version } from 'react-dom';

export function batchUpdatesForReact16(callback: () => void) {
	/**
	 * We only want to do this manual batching for version 16 of React.
	 *
	 * Version 18 will automatically batch updates.
	 */
	if (version.startsWith('16')) {
		unstable_batchedUpdates(callback);
		return;
	}

	callback();
}
