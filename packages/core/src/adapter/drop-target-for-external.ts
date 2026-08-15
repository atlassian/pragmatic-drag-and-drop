import { type CleanupFn } from '../internal-types';

import { adapter } from './external-adapter';
import type { StripEventsForDropTargets } from './external-adapter-types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function dropTargetForExternal(
	args: StripEventsForDropTargets<Parameters<typeof adapter.dropTarget>[0]>,
): CleanupFn {
	// not removing unused events, just leaning on the type system
	return adapter.dropTarget(args);
}
