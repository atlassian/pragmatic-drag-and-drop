import { wb, type WorkbenchExample } from '@atlassian/workbench';

import ScrollJustEnoughIntoViewExample from '../scroll-just-enough-into-view';

export const ScrollJustEnoughIntoView: WorkbenchExample<typeof ScrollJustEnoughIntoViewExample> =
	wb(ScrollJustEnoughIntoViewExample);
