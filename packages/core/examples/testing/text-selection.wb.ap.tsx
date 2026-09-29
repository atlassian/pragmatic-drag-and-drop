import { wb, type WorkbenchExample } from '@atlassian/workbench';

import TextSelectionExample from '../text-selection';

export const TextSelection: WorkbenchExample<typeof TextSelectionExample> =
	wb(TextSelectionExample);
