import { wb, type WorkbenchExample } from '@atlassian/workbench';

import StickinessExample from '../stickiness';

export const Stickiness: WorkbenchExample<typeof StickinessExample> = wb(StickinessExample);
