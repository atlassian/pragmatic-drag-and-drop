import { wb, type WorkbenchExample } from '@atlassian/workbench';

import FileExample from '../file';

export const File: WorkbenchExample<typeof FileExample> = wb(FileExample);
