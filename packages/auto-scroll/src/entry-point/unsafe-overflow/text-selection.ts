import { monitorForTextSelection } from '@atlaskit/pragmatic-drag-and-drop/text-selection/adapter';
import type { TextSelectionDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import { makeApi } from '../../unsafe-overflow/make-api';
import type { UnsafeOverflowAutoScrollArgs } from '../../unsafe-overflow/types';

const api = makeApi({ monitor: monitorForTextSelection });

export const unsafeOverflowAutoScrollForTextSelection: (args: UnsafeOverflowAutoScrollArgs<TextSelectionDragType>) => CleanupFn = api.unsafeOverflowAutoScroll;
