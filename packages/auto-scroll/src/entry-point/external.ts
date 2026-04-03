import { monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import type { ExternalDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ElementAutoScrollArgs, WindowAutoScrollArgs } from '../internal-types';
import { makeApi } from '../over-element/make-api';

const api = makeApi({ monitor: monitorForExternal });

export const autoScrollForExternal: (args: ElementAutoScrollArgs<ExternalDragType>) => CleanupFn = api.autoScroll;
export const autoScrollWindowForExternal: (args?: WindowAutoScrollArgs<ExternalDragType>) => CleanupFn = api.autoScrollWindow;
