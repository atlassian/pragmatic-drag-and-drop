import { wb, type WorkbenchExample } from '@atlassian/workbench';

import UnsafeOverflowOnlyExample from '../unsafe-overflow-only';

export const UnsafeOverflowOnly: WorkbenchExample<typeof UnsafeOverflowOnlyExample> =
	wb(UnsafeOverflowOnlyExample);
