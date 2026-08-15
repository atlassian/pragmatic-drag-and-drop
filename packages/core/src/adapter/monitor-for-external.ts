import { type CleanupFn } from '../internal-types';

import { adapter } from './external-adapter';
import type { StripEventsForMonitors } from './external-adapter-types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function monitorForExternal(
	args: StripEventsForMonitors<Parameters<typeof adapter.monitor>[0]>,
): CleanupFn {
	// not removing unused events, just leaning on the type system
	return adapter.monitor(args);
}
