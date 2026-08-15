import { type CleanupFn } from '../internal-types';

import { adapter } from './text-selection-adapter';
import type { StripPreviewEvent } from './text-selection-adapter-types';

export function dropTargetForTextSelection(
	args: StripPreviewEvent<Parameters<typeof adapter.dropTarget>[0]>,
): CleanupFn {
	// note: not removing `onGenerateDragPreview`; just leaning on the type system
	return adapter.dropTarget(args);
}
