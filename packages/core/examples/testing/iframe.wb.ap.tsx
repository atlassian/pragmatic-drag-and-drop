import { wb, type WorkbenchExample } from '@atlassian/workbench';

import IframeExample from '../iframe';

export const Iframe: WorkbenchExample<typeof IframeExample> = wb(IframeExample);
