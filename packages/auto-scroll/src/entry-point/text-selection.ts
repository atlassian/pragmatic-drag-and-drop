import { monitorForTextSelection } from '@atlaskit/pragmatic-drag-and-drop/text-selection/adapter';
import type { TextSelectionDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ElementAutoScrollArgs, WindowAutoScrollArgs } from '../internal-types';
import { makeApi } from '../over-element/make-api';

const api = makeApi({ monitor: monitorForTextSelection });

export const autoScrollForTextSelection: (
	args: ElementAutoScrollArgs<TextSelectionDragType>,
) => CleanupFn = api.autoScroll;
export const autoScrollWindowForTextSelection: (
	args?: WindowAutoScrollArgs<TextSelectionDragType>,
) => CleanupFn = api.autoScrollWindow;
