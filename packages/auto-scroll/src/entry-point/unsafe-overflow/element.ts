import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { ElementDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import { makeApi } from '../../unsafe-overflow/make-api';
import type { UnsafeOverflowAutoScrollArgs } from '../../unsafe-overflow/types';

const api = makeApi({ monitor: monitorForElements });

export const unsafeOverflowAutoScrollForElements: (
	args: UnsafeOverflowAutoScrollArgs<ElementDragType>,
) => CleanupFn = api.unsafeOverflowAutoScroll;
