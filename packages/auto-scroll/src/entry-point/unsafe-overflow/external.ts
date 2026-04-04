import { monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import type { ExternalDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import { makeApi } from '../../unsafe-overflow/make-api';
import type { UnsafeOverflowAutoScrollArgs } from '../../unsafe-overflow/types';

const api = makeApi({ monitor: monitorForExternal });

export const unsafeOverflowAutoScrollForExternal: (
	args: UnsafeOverflowAutoScrollArgs<ExternalDragType>,
) => CleanupFn = api.unsafeOverflowAutoScroll;
