import { type CleanupFn } from '../internal-types';

import { adapter } from './text-selection-adapter';
import type { StripPreviewEvent } from './text-selection-adapter-types';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function monitorForTextSelection(
	args: StripPreviewEvent<Parameters<typeof adapter.monitor>[0]>,
): CleanupFn {
	// note: not removing `onGenerateDragPreview`; just leaning on the type system
	return adapter.monitor(args);
}
