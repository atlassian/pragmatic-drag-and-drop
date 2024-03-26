import { monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';

import { makeApi } from '../over-element/make-api';

const api = makeApi({ monitor: monitorForExternal });

export const autoScrollForExternal = api.autoScroll;
export const autoScrollWindowForExternal = api.autoScrollWindow;
