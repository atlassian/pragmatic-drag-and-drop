import { wb, type WorkbenchExample } from '@atlassian/workbench';

import BoardExample from '../board.vr.ap';

export const Board: WorkbenchExample<typeof BoardExample> = wb(BoardExample);
