import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { ElementDragType, CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ElementAutoScrollArgs, WindowAutoScrollArgs } from '../internal-types';
import { makeApi } from '../over-element/make-api';

const api = makeApi({ monitor: monitorForElements });

export const autoScrollForElements: (args: ElementAutoScrollArgs<ElementDragType>) => CleanupFn = api.autoScroll;
export const autoScrollWindowForElements: (args?: WindowAutoScrollArgs<ElementDragType>) => CleanupFn = api.autoScrollWindow;
