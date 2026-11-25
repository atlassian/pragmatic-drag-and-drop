import { wb, type WorkbenchExample } from '@atlassian/workbench';

import ListExample from '../list.vr.ap';

export const List: WorkbenchExample<typeof ListExample> = wb(ListExample);
